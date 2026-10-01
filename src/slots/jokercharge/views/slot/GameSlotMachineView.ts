import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { SlotEvents } from '@core/events/SlotEvents';
import { RespinRoundAnimationData } from '@core/commands/states/RespinPreWinState';
import { EffectStep, playEffectSteps } from '@slots/jokercharge/views/effects/EffectSteps';
import { resolveModifierSteps } from '@slots/jokercharge/views/effects/ModifierEffects';

type TrailCell = { column: number; row: number };

// EnterRespinState waits on onComplete, but only if a listener claims the request with hold.
export interface TriggerWinData {
  hold: boolean;
  onComplete: () => void;
}

// Same shape as TriggerWinData: the state waits only if a listener claims the request.
export interface ModifierEffectsData {
  hold: boolean;
  onComplete: () => void;
}

export interface MetamorphicRevealData {
  entries: MetamorphicSymbol[];
  hold: boolean;
  onComplete: () => void;
}

const COINS_ANIM_STATE = 'all_animations';
// Runs under the whole metamorphic reveal, whose length depends on how many symbols land, so it
// loops until hideCoinsAnimation ends it as the feature opens.
const COINS_ANIM_LOOP = true;
import { BonusLayoutOverride, BONUS_TRIGGER_LAYOUT } from '@slots/jokercharge/config/screens/BonusTriggerLayoutConfig';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';
import {
  getTrailPlacement,
  TRAIL_ANIMATION,
  TRAIL_ARRIVAL_MS,
  TRAIL_SPINE_NAME,
  TrailDirection,
  TrailPlacement,
} from '@slots/jokercharge/config/screens/TrailAnimConfig';

import { RespinCounterComp } from '@slots/jokercharge/views/comps/RespinCounterComp';
import { BuyBonusLinesComp } from '@slots/jokercharge/views/comps/BuyBonusLinesComp';
import { HoldNWinReelsContainer, MysteryReveal } from '@slots/jokercharge/views/slot/HoldNWinReelsContainer';
import { toMysteryReelResult } from '@slots/jokercharge/views/slot/JCMysterySymbolModifier';
import { setRespinActive } from '@slots/jokercharge/models/JCLinesState';
import {
  getModifierMultipliers,
  getModifierRow,
  getMysteryReveals,
  MetamorphicSymbol,
  ModifierMultiplier,
} from '@slots/jokercharge/models/JCSpinData';

export class GameSlotMachineView extends ResponsiveChildrenView {
  private readonly savedLayout: Record<string, BonusLayoutOverride> = {};
  private readonly respinCounterComp: RespinCounterComp;
  private readonly buyBonusLinesComp: BuyBonusLinesComp;
  private readonly holdNWinReelsContainer: HoldNWinReelsContainer;
  private readonly coinsAnim: PixSpine;
  private readonly lineAnim: PixSpine;
  // lineAnim plus however many extra trail spines a spin has needed at once.
  private readonly trailPool: PixSpine[] = [];

  constructor(config: any) {
    super(config);
    this.respinCounterComp = this.elementsList['respinCounterComp'];
    this.buyBonusLinesComp = this.elementsList['buyBonusLinesComp'];
    this.holdNWinReelsContainer = this.elementsList['holdNWinReelsContainer'];
    this.coinsAnim = this.elementsList['coinsAnim'];
    this.lineAnim = this.elementsList['lineAnim'];
    this.trailPool.push(this.lineAnim);
    this.hookTrail(this.lineAnim);
    EventHandler.addEventListener(JCEvents.PLAY_TRAIL_ANIMATION, this.onPlayTrail.bind(this));
    EventHandler.addEventListener(JCEvents.SET_BONUS_TRIGGER_LAYOUT, this.onSetBonusTriggerLayout.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_RESPIN_ROUND_ANIMATION, this.onRespinRoundAnimation.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_COINS_ANIMATION, this.onPlayCoinsAnimation.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_METAMORPHIC_SYMBOLS, this.onPlayMetamorphicSymbols.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_TRIGGER_WIN_ANIMATION, this.onPlayTriggerWins.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_MODIFIER_EFFECTS, this.onPlayModifierEffects.bind(this));
  }

  private onPlayCoinsAnimation(): void {
    this.coinsAnim.visible = true;
    this.coinsAnim.playAnimation({ state: COINS_ANIM_STATE, loop: COINS_ANIM_LOOP });
  }

  private onPlayTrail(data: { column: number; row: number; direction?: TrailDirection }): void {
    this.playTrail(data.column, data.row, data.direction);
  }

  // Every cell's trail runs at once, so onComplete fires when they have all arrived.
  private playTrails(cells: TrailCell[], onComplete?: () => void, direction: TrailDirection = 'toLogo'): void {
    const placements = cells
      .map(({ column, row }) => getTrailPlacement(column, row, direction))
      .filter((placement): placement is TrailPlacement => !!placement);

    if (!placements.length) {
      onComplete?.();
      return;
    }

    placements.forEach((placement) => this.playTrailOn(this.acquireTrail(), placement));
    // Off the arrival time, not the spine's 'complete': the trails all start together, and what
    // the caller is waiting for is the head landing, not the tail finishing dissolving.
    if (onComplete) setTimeout(onComplete, TRAIL_ARRIVAL_MS);
  }

  // One spine per trail in flight, kept for reuse: a hidden one is free, and the grid caps how
  // many can ever run at once.
  private acquireTrail(): PixSpine {
    const free = this.trailPool.find((trail) => !trail.visible);
    if (free) return free;

    const trail = UIUtil.getSpineAnim(TRAIL_SPINE_NAME, { spineName: TRAIL_SPINE_NAME });
    trail.label = 'lineAnim';
    trail.visible = false;
    this.addChildAt(trail, this.getChildIndex(this.lineAnim) + 1);
    this.hookTrail(trail);
    this.trailPool.push(trail);
    return trail;
  }

  // Hidden when the whole animation has run, tail and all, which frees it back to the pool.
  private hookTrail(trail: PixSpine): void {
    trail.addEventListener('complete', () => {
      trail.visible = false;
    });
  }

  private playTrailOn(trail: PixSpine, placement: TrailPlacement): void {
    trail.position.set(placement.x, placement.y);
    trail.rotation = (placement.rotation * Math.PI) / 180;
    trail.scale.set(placement.scaleX, placement.scaleY);
    trail.visible = true;
    trail.playAnimation({ state: placement.animation ?? TRAIL_ANIMATION, loop: false });
  }

  public playTrail(column: number, row: number, direction: TrailDirection = 'toLogo'): void {
    this.playTrails([{ column, row }], undefined, direction);
  }

  private onPlayTriggerWins(data: TriggerWinData): void {
    data.hold = true;
    this.holdNWinReelsContainer.playActiveLineWins(data.onComplete);
  }

  // Each symbol is brought in from the logo: its trail runs first, and the moment that finishes
  // the cell plays the reveal it always did.
  private onPlayMetamorphicSymbols(data: MetamorphicRevealData): void {
    data.hold = true;
    this.holdNWinReelsContainer.playMetamorphicSymbols(data.entries, data.onComplete, (column, row, done) =>
      this.playTrails([{ column, row }], done, 'fromLogo'),
    );
  }

  private hideCoinsAnimation(): void {
    this.coinsAnim.stopAnimation();
    this.coinsAnim.visible = false;
  }

  // RespinPreWinState's hook, once a respin round's reels have settled. Claiming the round with
  // hold keeps the feature waiting until the effects finish; leaving it alone lets it carry on.
  private onRespinRoundAnimation(round: RespinRoundAnimationData): void {
    const modifierRow: string[] = getModifierRow() ?? [];
    const multipliers: ModifierMultiplier[] = getModifierMultipliers();
    const steps = [
      ...resolveModifierSteps(this.holdNWinReelsContainer, modifierRow),
      ...this.resolveMultiplierSteps(multipliers),
      ...this.resolveMysterySteps(),
    ];
    if (!steps.length) return;
    round.hold = true;
    playEffectSteps(steps, 0, round.onComplete);
  }

  // RespinSpinStartState's hook, once the player has dismissed the intro and before the first
  // round spins. The panel is already showing what the triggering spin landed, but nothing has
  // played it: the round animation only ever covers the round that just settled.
  private onPlayModifierEffects(request: ModifierEffectsData): void {
    const steps = resolveModifierSteps(this.holdNWinReelsContainer, getModifierRow() ?? []);
    if (!steps.length) return;
    request.hold = true;
    playEffectSteps(steps, 0, request.onComplete);
  }

  private resolveMultiplierSteps(multipliers: ModifierMultiplier[]): EffectStep[] {
    if (!multipliers.length) return [];
    return [(done) => this.holdNWinReelsContainer.applyMultipliers(multipliers, done)];
  }

  // Held mystery symbols have been spinning since the feature opened; the round that closes it is
  // the one that says what they are, and they land together.
  private resolveMysterySteps(): EffectStep[] {
    const reveals = getMysteryReveals();
    if (!reveals.length) return [];
    const entries: MysteryReveal[] = reveals.map(({ position, symbol, value }) => ({
      position,
      result: toMysteryReelResult(symbol, value),
    }));
    return [(done) => this.holdNWinReelsContainer.revealMysterySymbols(entries, done)];
  }

  private resolveTargetLayout(): Record<string, BonusLayoutOverride> {
    if (!DeviceProxy.config.isDevice) return BONUS_TRIGGER_LAYOUT.Desktop;
    return DeviceProxy.config.isPortrait ? BONUS_TRIGGER_LAYOUT.Portrait : BONUS_TRIGGER_LAYOUT.Landscape;
  }

  // Each element's base state, remembered the first time the feature takes it over.
  private captureLayout(targetLayout: Record<string, BonusLayoutOverride>): void {
    for (const name of Object.keys(targetLayout)) {
      const element = this.elementsList[name];
      if (!element || this.savedLayout[name]) continue;
      this.savedLayout[name] = {
        x: element.x,
        y: element.y,
        alpha: element.alpha,
        visible: element.visible,
        scaleX: element.scale.x,
        scaleY: element.scale.y,
      };
    }
  }

  private onSetBonusTriggerLayout(data: { active: boolean }): void {
    this.setBonusTriggerLayout(data.active);
  }

  // The respin states call this from the transition's midpoint, so the swap is hidden by the wipe.
  public setBonusTriggerLayout(bonusTrigger: boolean): void {
    const targetLayout = this.resolveTargetLayout();
    // Taken before anything below touches an element: the counter is flipped on entry, and if its
    // snapshot were taken after that, leaving would restore it as visible.
    this.captureLayout(targetLayout);

    this.respinCounterComp.visible = bonusTrigger;
    // Neither buying a bonus nor changing the line count is allowed mid-feature. Toggled here
    // rather than through the layout map so it is not tied to a captured snapshot: its position
    // differs per orientation, and a rotation during the feature would restore the wrong one.
    this.buyBonusLinesComp.visible = !bonusTrigger;
    // Blanks already on the grid need re-checking now, not just on their next placement.
    setRespinActive(bonusTrigger);
    this.holdNWinReelsContainer?.refreshBlanksVisuals();
    // Entering, the symbols that triggered the feature already sit out the respins; leaving,
    // every cell takes part again.
    if (bonusTrigger) {
      this.hideCoinsAnimation();
      // The locks only hold through the base game; inside the feature every filled cell is held
      // anyway, by holdFilledCells.
      this.holdNWinReelsContainer?.releaseStickyCells();
      this.holdNWinReelsContainer?.holdFilledCells();
      this.holdNWinReelsContainer?.startMysteryReels();
    } else {
      this.holdNWinReelsContainer?.releaseAllCells();
      this.holdNWinReelsContainer?.clearMultipliers();
      this.holdNWinReelsContainer?.stopMysteryReels();
    }

    for (const name of Object.keys(targetLayout)) {
      const element = this.elementsList[name];
      if (!element) continue;

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
      if (target.visible !== undefined) {
        element.visible = target.visible;
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
