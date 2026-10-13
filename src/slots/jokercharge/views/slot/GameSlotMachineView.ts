import { Container, Matrix } from 'pixi.js';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { SlotEvents } from '@core/events/SlotEvents';
import { RespinRoundAnimationData } from '@core/commands/states/RespinPreWinState';
import { EffectStep, playEffectSteps } from '@slots/jokercharge/views/effects/EffectSteps';
import { resolveModifierSteps } from '@slots/jokercharge/views/effects/ModifierEffects';
import { resolveMysteryRevealSteps } from '@slots/jokercharge/views/effects/MysteryRevealEffect';
import { resolveMultiplierApplySteps } from '@slots/jokercharge/views/effects/MultiplierApplyEffect';
import { playTotalWinCollect, TotalWinCollectHost } from '@slots/jokercharge/views/effects/TotalWinCollectEffect';
import { BoostCollectHost, resolveBoostCollectSteps } from '@slots/jokercharge/views/effects/BoostCollectEffect';

// value, in bet multiples, is shown on the trail head; only the total-win collect sends one.
type TrailCell = { column: number; row: number; value?: number };

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

// Same again, for the feature's payout - see TotalWinCollectEffect.
export interface TotalWinCollectData {
  hold: boolean;
  onComplete: () => void;
}

// onHalfway fires halfway through the shower, which is the reveal's cue; the shower carries on.
export interface CoinsAnimationData {
  hold: boolean;
  onHalfway: () => void;
}

export interface MetamorphicRevealData {
  entries: MetamorphicSymbol[];
  hold: boolean;
  onComplete: () => void;
}

const COINS_SPINE_NAME = 'coins';
// In the slot machine's space, drawn just above the trails.
const COINS_ANIM_PLACEMENT = { x: 666.5, y: -167, scale: 0.8 };
const COINS_ANIM_STATE = 'all_animations';
// coins.json's own length for that animation, used only if it can't be read off the skeleton.
const COINS_FALLBACK_DURATION = 4;
// How far into the shower the metamorphic symbols start arriving.
const COINS_REVEAL_AT = 0.5;
// One per cell of the 3x3 grid, the most the total win collect ever has in flight - see prewarmTrails.
const TRAIL_PREWARM_COUNT = 9;
// Runs under the whole metamorphic reveal, whose length depends on how many symbols land, so it
// loops until hideCoinsAnimation ends it as the feature opens.
const COINS_ANIM_LOOP = true;
import { BonusLayoutOverride, BONUS_TRIGGER_LAYOUT } from '@slots/jokercharge/config/screens/BonusTriggerLayoutConfig';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';
import {
  fitTrailPlacement,
  getBoostTrailPlacement,
  getTrailPlacement,
  TRAIL_ANIMATION,
  TRAIL_ARRIVAL_MS,
  TRAIL_HEAD_LANDED_MS,
  TRAIL_COLLECT_SPEED,
  TRAIL_COLLECT_STAGGER_MS,
  TRAIL_SPINE_NAME,
  TRAIL_VALUE_SLOT,
  TRAIL_VALUE_TEXT_CONFIG,
  TRAIL_VALUE_TEXT_SCALE,
  TrailDirection,
  TrailPlacement,
} from '@slots/jokercharge/config/screens/TrailAnimConfig';

import { LogoComp } from '@slots/jokercharge/views/comps/LogoComp';
import { RespinCounterComp } from '@slots/jokercharge/views/comps/RespinCounterComp';
import { BuyBonusLinesComp } from '@slots/jokercharge/views/comps/BuyBonusLinesComp';
import { HoldNWinPosition, HoldNWinReelsContainer } from '@slots/jokercharge/views/slot/HoldNWinReelsContainer';
import { getLineBet, setRespinActive } from '@slots/jokercharge/models/JCLinesState';
import {
  getModifierMultipliers,
  getModifierRow,
  MetamorphicSymbol,
  ModifierMultiplier,
} from '@slots/jokercharge/models/JCSpinData';

export class GameSlotMachineView extends ResponsiveChildrenView implements TotalWinCollectHost, BoostCollectHost {
  private readonly savedLayout: Record<string, BonusLayoutOverride> = {};
  private readonly respinCounterComp: RespinCounterComp;
  private readonly buyBonusLinesComp: BuyBonusLinesComp;
  private readonly holdNWinReelsContainer: HoldNWinReelsContainer;
  private readonly logoComp: LogoComp;
  // Built once SECONDARY arrives - see onSecondaryAssetsLoaded.
  private coinsAnim: PixSpine | null = null;
  private readonly lineAnim: PixSpine;
  // lineAnim plus however many extra trail spines a spin has needed at once.
  private readonly trailPool: PixSpine[] = [];
  // Each trail's figure on its TxtValue slot, built the first time that trail carries one.
  private readonly trailValueTexts = new Map<PixSpine, PixText>();
  // The pending hide of each trail's figure - see playTrailOn.
  private readonly trailValueHideIds = new Map<PixSpine, any>();
  // Scratch matrices for keepTrailValueUpright, reused every frame.
  private readonly viewMatrix = new Matrix();
  private readonly holderMatrix = new Matrix();
  private readonly uprightMatrix = new Matrix();

  constructor(config: any) {
    super(config);
    this.respinCounterComp = this.elementsList['respinCounterComp'];
    this.buyBonusLinesComp = this.elementsList['buyBonusLinesComp'];
    this.holdNWinReelsContainer = this.elementsList['holdNWinReelsContainer'];
    this.logoComp = this.elementsList['logoComp'];
    this.lineAnim = this.elementsList['lineAnim'];
    this.trailPool.push(this.lineAnim);
    this.hookTrail(this.lineAnim);
    this.lineAnim.setAutoUpdate(!!this.lineAnim.visible);
    EventHandler.addEventListener(JCEvents.PLAY_TRAIL_ANIMATION, this.onPlayTrail.bind(this));
    EventHandler.addEventListener(JCEvents.SET_BONUS_TRIGGER_LAYOUT, this.onSetBonusTriggerLayout.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_RESPIN_ROUND_ANIMATION, this.onRespinRoundAnimation.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_COINS_ANIMATION, this.onPlayCoinsAnimation.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_METAMORPHIC_SYMBOLS, this.onPlayMetamorphicSymbols.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_TRIGGER_WIN_ANIMATION, this.onPlayTriggerWins.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_MODIFIER_EFFECTS, this.onPlayModifierEffects.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_TOTAL_WIN_COLLECT, this.onPlayTotalWinCollect.bind(this));
  }

  // Built here rather than from config: the coins are feature art, in SECONDARY. No animation is
  // set going - the shower is fired by JCEvents.PLAY_COINS_ANIMATION.
  protected onSecondaryAssetsLoaded(): void {
    super.onSecondaryAssetsLoaded();
    if (this.coinsAnim) return;
    const coins = UIUtil.getSpineAnim(COINS_SPINE_NAME, { spineName: COINS_SPINE_NAME });
    coins.label = 'coinsAnim';
    coins.visible = false;
    // Off the ticker until it plays - see hideCoinsAnimation.
    coins.setAutoUpdate(false);
    coins.position.set(COINS_ANIM_PLACEMENT.x, COINS_ANIM_PLACEMENT.y);
    coins.scale.set(COINS_ANIM_PLACEMENT.scale);
    this.addChildAt(coins, this.getChildIndex(this.lineAnim) + 1);
    this.coinsAnim = coins;
    this.prewarmTrails();
  }

  private onPlayCoinsAnimation(request: CoinsAnimationData): void {
    if (!this.coinsAnim) return;
    request.hold = true;
    this.coinsAnim.visible = true;
    this.coinsAnim.setAutoUpdate(true);
    this.coinsAnim.playAnimation({ state: COINS_ANIM_STATE, loop: COINS_ANIM_LOOP });
    setTimeout(request.onHalfway, this.resolveCoinsDurationMs() * COINS_REVEAL_AT);
  }

  // PixSpine has no duration getter, so this reaches through to its Spine - see TransitionComp.
  private resolveCoinsDurationMs(): number {
    const spineAnim = (this.coinsAnim as any)?.spineAnim;
    const duration = spineAnim?.skeleton?.data?.findAnimation?.(COINS_ANIM_STATE)?.duration;
    return (duration || COINS_FALLBACK_DURATION) * 1000;
  }

  private onPlayTrail(data: { column: number; row: number; direction?: TrailDirection }): void {
    this.playTrail(data.column, data.row, data.direction);
  }

  // Every cell's trail runs at once, so onComplete fires when they have all arrived.
  private playTrails(
    cells: TrailCell[],
    onComplete?: () => void,
    direction: TrailDirection = 'toLogo',
    speed = 1,
  ): void {
    const runs = cells
      .map(({ column, row, value }) => ({ placement: getTrailPlacement(column, row, direction), value }))
      .filter((run): run is { placement: TrailPlacement; value: number | undefined } => !!run.placement);

    if (!runs.length) {
      onComplete?.();
      return;
    }

    runs.forEach(({ placement, value }) => this.playTrailOn(this.acquireTrail(), placement, value, speed));
    const arrivalMs = TRAIL_ARRIVAL_MS / speed;
    // Only the trails running up to the logo, never the ones it sends back down.
    if (direction === 'toLogo') {
      setTimeout(() => EventHandler.dispatchEvent(JCEvents.PLAY_LOGO_COLLECT_ANIM), arrivalMs);
    }
    // Off the arrival time, not the spine's 'complete': the trails all start together, and what
    // the caller is waiting for is the head landing, not the tail finishing dissolving.
    if (onComplete) setTimeout(onComplete, arrivalMs);
  }

  // One spine per trail in flight, kept for reuse: a hidden one is free, and the grid caps how
  // many can ever run at once.
  private acquireTrail(): PixSpine {
    return this.trailPool.find((trail) => !trail.visible) ?? this.createTrail();
  }

  private createTrail(): PixSpine {
    const trail = UIUtil.getSpineAnim(TRAIL_SPINE_NAME, { spineName: TRAIL_SPINE_NAME });
    trail.label = 'lineAnim';
    trail.visible = false;
    trail.setAutoUpdate(false);
    this.addChildAt(trail, this.getChildIndex(this.lineAnim) + 1);
    this.hookTrail(trail);
    this.trailPool.push(trail);
    return trail;
  }

  // The total win collect sends one trail per cell, so the grid is the most ever in flight. Built,
  // and their figures' Texts with them, while nothing is playing, rather than in the frames of the
  // first collect.
  private prewarmTrails(): void {
    while (this.trailPool.length < TRAIL_PREWARM_COUNT) this.createTrail();
    this.trailPool.forEach((trail) => {
      this.setTrailValue(trail, 0);
      this.setTrailValue(trail, undefined);
    });
  }

  // Hidden when the whole animation has run, tail and all, which frees it back to the pool.
  private hookTrail(trail: PixSpine): void {
    trail.addEventListener('complete', () => {
      trail.visible = false;
      // A hidden spine still ticks; playTrailOn puts it back on.
      trail.setAutoUpdate(false);
      // Its text renders on its own hook, which runs whether or not the trail is visible.
      const text = this.trailValueTexts.get(trail);
      if (text) text.visible = false;
    });
  }

  private playTrailOn(trail: PixSpine, placement: TrailPlacement, value: number | undefined, speed: number): void {
    trail.position.set(placement.x, placement.y);
    trail.rotation = (placement.rotation * Math.PI) / 180;
    trail.scale.set(placement.scaleX, placement.scaleY);
    this.setTrailValue(trail, value);
    // Off as the head lands. The slot carrying it is never hidden by the animation itself, and the
    // text cancels the bone's scale to stay level, so the head shrinking away does not take it too.
    clearTimeout(this.trailValueHideIds.get(trail));
    this.trailValueHideIds.delete(trail);
    if (value !== undefined) {
      this.trailValueHideIds.set(
        trail,
        setTimeout(() => {
          this.trailValueHideIds.delete(trail);
          this.setTrailValue(trail, undefined);
        }, TRAIL_HEAD_LANDED_MS / speed),
      );
    }
    trail.visible = true;
    trail.setAutoUpdate(true);
    trail.playAnimation({ state: placement.animation ?? TRAIL_ANIMATION, loop: false });
    // After the play: playAnimation resets the speed to 1, which also keeps pooled reuse at normal speed.
    trail.setAnimationSpeed(speed);
  }

  // Trails are pooled and shared with the ones that carry no figure, so those hide whatever the
  // spine showed last.
  private setTrailValue(trail: PixSpine, value?: number): void {
    let text = this.trailValueTexts.get(trail);
    if (value === undefined) {
      if (text) text.visible = false;
      return;
    }
    if (!text) {
      text = UIUtil.getElement(TRAIL_VALUE_TEXT_CONFIG) as PixText;
      text.anchor.set(0.5);
      // Spine overwrites a slot object's whole transform every frame, so the text goes inside this.
      const holder = new Container();
      holder.label = 'trailValueHolder';
      holder.addChild(text);
      trail.addSlotObject(TRAIL_VALUE_SLOT, holder);
      text.onRender = () => this.keepTrailValueUpright(holder, text);
      this.trailValueTexts.set(trail, text);
    }
    // Formatted as the cash symbol formats it - see JCBonusSymbolModifier.
    text.text = Util.formatCurrencyNoSymbol(value * getLineBet());
    text.visible = true;
  }

  // The slot hands the holder the bone's and the trail's rotation, scale, flip and skew. The text
  // undoes all of it, so only the bone's position carries through and it reads level, at one size.
  private keepTrailValueUpright(holder: Container, text: PixText): void {
    if (!text.visible) return;
    const view = this.getGlobalTransform(this.viewMatrix).invert();
    const rel = view.append(holder.getGlobalTransform(this.holderMatrix));
    const upright = this.uprightMatrix.set(rel.a, rel.b, rel.c, rel.d, 0, 0);
    // A bone scaled to nothing has no inverse; the head is invisible then anyway.
    if (Math.abs(upright.a * upright.d - upright.b * upright.c) < 1e-6) {
      text.alpha = 0;
      return;
    }
    text.alpha = 1;
    upright.invert().scale(TRAIL_VALUE_TEXT_SCALE, TRAIL_VALUE_TEXT_SCALE);
    text.setFromMatrix(upright);
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
    if (!this.coinsAnim) return;
    this.coinsAnim.stopAnimation();
    this.coinsAnim.visible = false;
    // stopAnimation only pauses the track, which would leave a hidden skeleton ticking.
    this.coinsAnim.setAutoUpdate(false);
  }

  // RespinPreWinState's hook, once a respin round's reels have settled. Claiming the round with
  // hold keeps the feature waiting until the effects finish; leaving it alone lets it carry on.
  private onRespinRoundAnimation(round: RespinRoundAnimationData): void {
    const modifierRow: string[] = getModifierRow() ?? [];
    const multipliers: ModifierMultiplier[] = getModifierMultipliers();
    const steps = [
      ...resolveModifierSteps(this.holdNWinReelsContainer, modifierRow),
      ...this.resolveMultiplierSteps(multipliers),
      ...resolveMysteryRevealSteps(this.holdNWinReelsContainer),
      ...resolveMultiplierApplySteps(this.holdNWinReelsContainer),
    ];
    if (!steps.length) return;
    round.hold = true;
    playEffectSteps(steps, 0, round.onComplete);
  }

  // RespinSpinStartState's hook, once the player has dismissed the intro and before the first
  // round spins. The panel is already showing what the triggering spin landed, but nothing has
  // played it: the round animation only ever covers the round that just settled.
  // Any boost the trigger landed collects first, before the top panel plays.
  private onPlayModifierEffects(request: ModifierEffectsData): void {
    const container = this.holdNWinReelsContainer;
    const steps = [
      ...resolveBoostCollectSteps(container, this, container.getBoostPositions()),
      ...resolveModifierSteps(this.holdNWinReelsContainer, getModifierRow() ?? []),
      ...this.resolveMultiplierSteps(getModifierMultipliers()),
    ];
    if (!steps.length) return;
    request.hold = true;
    playEffectSteps(steps, 0, request.onComplete);
  }

  // JCExitRespinState's hook, after the panel has arrived and before the wipe home.
  private onPlayTotalWinCollect(request: TotalWinCollectData): void {
    if (!this.holdNWinReelsContainer.getCollectTargets().length) return;
    request.hold = true;
    playTotalWinCollect(this.holdNWinReelsContainer, this, request.onComplete);
  }

  // TotalWinCollectHost.
  public sendTrailToLogo(
    column: number,
    row: number,
    value: number,
    onArrive: () => void,
    onNextMayStart: () => void,
  ): void {
    this.playTrails([{ column, row, value }], onArrive, 'toLogo', TRAIL_COLLECT_SPEED);
    setTimeout(onNextMayStart, TRAIL_COLLECT_STAGGER_MS);
  }

  // BoostCollectHost.
  public sendTrailToBoost(from: HoldNWinPosition, to: HoldNWinPosition, onArrive: () => void): void {
    const placement = getBoostTrailPlacement(from, to) ?? fitTrailPlacement(this.cellCentre(from), this.cellCentre(to));
    this.playTrailOn(this.acquireTrail(), placement, undefined, 1);
    setTimeout(onArrive, TRAIL_ARRIVAL_MS);
  }

  // A cell's centre in this view's space, which is the space the trails are placed in.
  private cellCentre({ column, row }: HoldNWinPosition): { x: number; y: number } {
    return this.toLocal(this.holdNWinReelsContainer.getReel(column, row).getGlobalPosition());
  }

  public resetTotalWin(): void {
    this.logoComp?.resetTotalWin();
  }

  public addTotalWin(value: number, duration: number, onComplete: () => void): void {
    if (!this.logoComp) {
      onComplete();
      return;
    }
    this.logoComp.addTotalWin(value, duration, onComplete);
  }

  private resolveMultiplierSteps(multipliers: ModifierMultiplier[]): EffectStep[] {
    if (!multipliers.length) return [];
    return [(done) => this.holdNWinReelsContainer.applyMultipliers(multipliers, done)];
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
      // Left over from the feature before this one, which closed on it.
      this.logoComp?.hideTotalWinPanel();
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
