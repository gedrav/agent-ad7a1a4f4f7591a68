import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { BonusLayoutOverride, BONUS_TRIGGER_LAYOUT } from '@slots/jokerCharge/config/screens/BonusTriggerLayoutConfig';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { RespinCounterComp } from '@slots/jokerCharge/views/comps/RespinCounterComp';
import { HoldNWinReelsContainer } from '@slots/jokerCharge/views/slot/HoldNWinReelsContainer';
import { setRespinActive } from '@slots/jokerCharge/models/JCLinesState';

export class GameSlotMachineView extends ResponsiveChildrenView {
  private readonly savedLayout: Record<string, BonusLayoutOverride> = {};
  private readonly respinCounterComp: RespinCounterComp;
  private readonly holdNWinReelsContainer: HoldNWinReelsContainer;

  constructor(config: any) {
    super(config);
    this.respinCounterComp = this.elementsList['respinCounterComp'];
    this.holdNWinReelsContainer = this.elementsList['holdNWinReelsContainer'];
    EventHandler.addEventListener(JCEvents.SET_BONUS_TRIGGER_LAYOUT, this.onSetBonusTriggerLayout.bind(this));
  }

  private onSetBonusTriggerLayout(data: { active: boolean }): void {
    this.setBonusTriggerLayout(data.active);
  }

  // The respin states call this from the transition's midpoint, so the swap is hidden by the wipe.
  public setBonusTriggerLayout(bonusTrigger: boolean): void {
    this.respinCounterComp.visible = bonusTrigger;
    // Blanks already on the grid need re-checking now, not just on their next placement.
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
}
