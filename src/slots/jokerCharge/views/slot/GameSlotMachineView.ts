import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { RespinRoundAnimationData } from '@core/commands/states/RespinPreWinState';
import {
  CHARGED_SYMBOL_NAME,
  MULTI_SYMBOL_NAME,
  SUPER_CHARGED_SYMBOL_NAME,
  SUPER_MULTI_SYMBOL_NAME,
} from '@slots/jokerCharge/config/BonusSymbolsConfig';

// One beat of the round's animation. Steps run in order, each starting when the last finishes.
type EffectStep = (onComplete: () => void) => void;

// EnterRespinState waits on onComplete, but only if a listener claims the request with hold.
export interface TriggerWinData {
  hold: boolean;
  onComplete: () => void;
}

export interface MetamorphicRevealData {
  entries: MetamorphicSymbol[];
  hold: boolean;
  onComplete: () => void;
}

const COINS_ANIM_STATE = 'all_animations';
// Temporary: looped so the placement can be judged on screen.
const COINS_ANIM_LOOP = true;
import { BonusLayoutOverride, BONUS_TRIGGER_LAYOUT } from '@slots/jokerCharge/config/screens/BonusTriggerLayoutConfig';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { RespinCounterComp } from '@slots/jokerCharge/views/comps/RespinCounterComp';
import {
  HoldNWinReelsContainer,
  MetamorphicSymbol,
  ModifierMultiplier,
} from '@slots/jokerCharge/views/slot/HoldNWinReelsContainer';
import { setRespinActive } from '@slots/jokerCharge/models/JCLinesState';

export class GameSlotMachineView extends ResponsiveChildrenView {
  private readonly savedLayout: Record<string, BonusLayoutOverride> = {};
  private readonly respinCounterComp: RespinCounterComp;
  private readonly holdNWinReelsContainer: HoldNWinReelsContainer;
  private readonly coinsAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.respinCounterComp = this.elementsList['respinCounterComp'];
    this.holdNWinReelsContainer = this.elementsList['holdNWinReelsContainer'];
    this.coinsAnim = this.elementsList['coinsAnim'];
    EventHandler.addEventListener(JCEvents.SET_BONUS_TRIGGER_LAYOUT, this.onSetBonusTriggerLayout.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_RESPIN_ROUND_ANIMATION, this.onRespinRoundAnimation.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_COINS_ANIMATION, this.onPlayCoinsAnimation.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_METAMORPHIC_SYMBOLS, this.onPlayMetamorphicSymbols.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_TRIGGER_WIN_ANIMATION, this.onPlayTriggerWins.bind(this));
  }

  private onPlayCoinsAnimation(): void {
    this.coinsAnim.visible = true;
    this.coinsAnim.playAnimation({ state: COINS_ANIM_STATE, loop: COINS_ANIM_LOOP });
  }

  private onPlayTriggerWins(data: TriggerWinData): void {
    data.hold = true;
    this.holdNWinReelsContainer.playActiveLineWins(data.onComplete);
  }

  private onPlayMetamorphicSymbols(data: MetamorphicRevealData): void {
    data.hold = true;
    this.holdNWinReelsContainer.playMetamorphicSymbols(data.entries, data.onComplete);
  }

  private hideCoinsAnimation(): void {
    this.coinsAnim.stopAnimation();
    this.coinsAnim.visible = false;
  }

  // RespinPreWinState's hook, once a respin round's reels have settled. Claiming the round with
  // hold keeps the feature waiting until the effects finish; leaving it alone lets it carry on.
  private onRespinRoundAnimation(round: RespinRoundAnimationData): void {
    const feature = appModel.featureResult;
    const modifierRow: string[] = feature?.modifierRow ?? [];
    const multipliers: ModifierMultiplier[] = feature?.modifierMultipliers ?? [];
    const steps = [
      ...this.resolveBorderEffectSteps(modifierRow),
      ...this.resolveColumnEffectSteps(modifierRow),
      ...this.resolveMultiplierSteps(multipliers),
    ];
    if (!steps.length) return;
    round.hold = true;
    this.playEffectSteps(steps, 0, round.onComplete);
  }

  // A Super-Charged anywhere lights the grid's outer edges; otherwise each Charged lights the two
  // borders flanking its own column, one step at a time.
  private resolveBorderEffectSteps(modifierRow: string[]): EffectStep[] {
    const container = this.holdNWinReelsContainer;
    if (modifierRow.includes(SUPER_CHARGED_SYMBOL_NAME)) {
      return [(done) => container.playBorderEffects([0, modifierRow.length], done)];
    }
    return modifierRow.reduce<EffectStep[]>((steps, symbol, column) => {
      if (symbol === CHARGED_SYMBOL_NAME) {
        steps.push((done) => container.playBorderEffects([column, column + 1], done));
      }
      return steps;
    }, []);
  }

  // A Super-Multi anywhere lights every column at once; otherwise each Multi fires on its own
  // column, one step at a time.
  private resolveColumnEffectSteps(modifierRow: string[]): EffectStep[] {
    const container = this.holdNWinReelsContainer;
    if (modifierRow.includes(SUPER_MULTI_SYMBOL_NAME)) {
      return [
        (done) =>
          container.playColumnEffects(
            modifierRow.map((_, column) => column),
            done,
          ),
      ];
    }
    return modifierRow.reduce<EffectStep[]>((steps, symbol, column) => {
      if (symbol === MULTI_SYMBOL_NAME) {
        steps.push((done) => container.playColumnEffects([column], done));
      }
      return steps;
    }, []);
  }

  private resolveMultiplierSteps(multipliers: ModifierMultiplier[]): EffectStep[] {
    if (!multipliers.length) return [];
    return [(done) => this.holdNWinReelsContainer.applyMultipliers(multipliers, done)];
  }

  private playEffectSteps(steps: EffectStep[], index: number, onComplete: () => void): void {
    if (index >= steps.length) {
      onComplete();
      return;
    }
    steps[index](() => this.playEffectSteps(steps, index + 1, onComplete));
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
    // Entering, the symbols that triggered the feature already sit out the respins; leaving,
    // every cell takes part again.
    if (bonusTrigger) {
      this.hideCoinsAnimation();
      this.holdNWinReelsContainer?.holdFilledCells();
      this.holdNWinReelsContainer?.startMysteryReels();
    } else {
      this.holdNWinReelsContainer?.releaseAllCells();
      this.holdNWinReelsContainer?.clearMultipliers();
      this.holdNWinReelsContainer?.stopMysteryReels();
    }

    let targetLayout = BONUS_TRIGGER_LAYOUT.Desktop;
    if (DeviceProxy.config.isDevice) {
      targetLayout = DeviceProxy.config.isPortrait ? BONUS_TRIGGER_LAYOUT.Portrait : BONUS_TRIGGER_LAYOUT.Landscape;
    }

    for (const name of Object.keys(targetLayout)) {
      const element = this.elementsList[name];
      if (!element) continue;

      if (!this.savedLayout[name]) {
        this.savedLayout[name] = {
          x: element.x,
          y: element.y,
          alpha: element.alpha,
          scaleX: element.scale.x,
          scaleY: element.scale.y,
        };
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
      if (target.scaleX !== undefined) {
        element.scale.x = target.scaleX;
      }
      if (target.scaleY !== undefined) {
        element.scale.y = target.scaleY;
      }
    }
  }
}
