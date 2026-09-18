import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { BonusLayoutOverride, BONUS_TRIGGER_LAYOUT } from '@slots/jokerCharge/config/screens/BonusTriggerLayoutConfig';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { RespinCounterComp } from '@slots/jokerCharge/views/comps/RespinCounterComp';
import { HoldNWinReelsContainer } from '@slots/jokerCharge/views/slot/HoldNWinReelsContainer';
import { BonusReelsContainer } from '@slots/jokerCharge/views/slot/BonusReelsContainer';
import { setRespinActive } from '@slots/jokerCharge/models/JCLinesState';

export class GameSlotMachineView extends ResponsiveChildrenView {
  private readonly savedLayout: Record<string, BonusLayoutOverride> = {};
  private readonly respinCounterComp: RespinCounterComp;
  private readonly holdNWinReelsContainer: HoldNWinReelsContainer;
  private readonly bonusReelsContainer: BonusReelsContainer;

  constructor(config: any) {
    super(config);
    this.respinCounterComp = this.elementsList['respinCounterComp'];
    this.holdNWinReelsContainer = this.elementsList['holdNWinReelsContainer'];
    this.bonusReelsContainer = this.elementsList['bonusReelsContainer'];
    EventHandler.addEventListener(JCEvents.SET_BONUS_TRIGGER_LAYOUT, this.onSetBonusTriggerLayout.bind(this));
    // Testing
    // // TEMPORARY: cycles the respin counter for visual testing - remove once not needed.
    this.setBonusTriggerLayout(true);
    // TEMPORARY: gives the bonus layout a beat to settle, then spins the top panel - remove
    // alongside testSpinBonusReels() once the respin response drives these reels.
    setTimeout(() => this.testSpinBonusReels(), 2000);
  }

  // Entry point for the respin states (see EnterRespinState/ExitRespinState), which have no view
  // reference of their own.
  private onSetBonusTriggerLayout(data: { active: boolean; onConfirm?: () => void }): void {
    this.setBonusTriggerLayout(data.active, data.onConfirm);
  }

  // To set the BONUS game screen. onConfirm (entering the feature) holds the transition on an OK
  // button and fires once the player confirms - see TransitionComp.
  public setBonusTriggerLayout(bonusTrigger: boolean, onConfirm?: () => void): void {
    EventHandler.dispatchEvent(JCEvents.PLAY_TRANSITION, { onConfirm });
    // Starts hidden (see RespinCounterConfig.ts); only shown as part of this bonus-trigger flow.
    this.respinCounterComp.visible = bonusTrigger;
    // Hold & Win cells all show their "active" blank variant for the duration of a respin,
    // regardless of the selected line count - see JCLinesState.isRowActive(). Cells already
    // showing a Blanks symbol need refreshing immediately, not just on their next placement.
    setRespinActive(bonusTrigger);
    this.holdNWinReelsContainer?.refreshBlanksVisuals();

    let targetLayout = BONUS_TRIGGER_LAYOUT.Desktop;
    if (DeviceProxy.config.isDevice) {
      targetLayout = DeviceProxy.config.isPortrait ? BONUS_TRIGGER_LAYOUT.Portrait : BONUS_TRIGGER_LAYOUT.Landscape;
    }

    for (const name of Object.keys(targetLayout)) {
      const element = this.elementsList[name];
      if (!element) continue;

      if (!this.savedLayout[name]) {
        this.savedLayout[name] = { x: element.x, y: element.y, alpha: element.alpha };
      }

      const target = bonusTrigger ? targetLayout[name] : this.savedLayout[name];
      if (target.x !== undefined) {
        element.x = target.x;
      }
      if (target.y !== undefined) {
        element.y = target.y;
      }
      if (target.alpha !== undefined) {
        element.alpha = target.alpha;
      }
    }
  }

  // TEMPORARY: manual test hook, e.g. slotMachineView.testShowRespinCounter(2) from the console -
  // remove once not needed.
  public testShowRespinCounter(remaining: number): void {
    this.respinCounterComp.visible = true;
    this.respinCounterComp.setRemainingRespins(remaining);
  }

  // TEMPORARY: manual test hook, e.g. slotMachineView.testSpinBonusReels() from the console -
  // spins the top panel and lands it on random symbols. Remove once the respin response drives
  // these reels for real.
  public testSpinBonusReels(stopAfter = 2000): void {
    this.bonusReelsContainer.spin();
    setTimeout(() => {
      this.bonusReelsContainer.stopSpinRandom((finalSymbols) => {
        console.log('[BonusReels] settled on', finalSymbols);
      });
    }, stopAfter);
  }
}
