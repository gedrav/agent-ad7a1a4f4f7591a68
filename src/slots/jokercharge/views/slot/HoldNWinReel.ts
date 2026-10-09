import { Container, Ticker } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import {
  MULTIPLIER_APPLY_COUNT_DURATION,
  MULTIPLIER_APPLY_MOVE_DURATION,
  MULTIPLIER_APPLY_MOVE_EASE,
  MULTIPLIER_APPLY_SHRINK_DURATION,
  MULTIPLIER_APPLY_SHRINK_EASE,
  MULTIPLIER_BADGE_ARRIVE_DURATION,
  MULTIPLIER_BADGE_ARRIVE_EASE,
  MULTIPLIER_BADGE_INSET,
  MULTIPLIER_BADGE_MOVE_DELAY,
  MULTIPLIER_BADGE_MOVE_DURATION,
  MULTIPLIER_BADGE_PULSE_DURATION,
  MULTIPLIER_BADGE_PULSE_EASE,
  MULTIPLIER_BADGE_PULSE_REPEAT,
  MULTIPLIER_BADGE_PULSE_SCALE,
  MULTIPLIER_BADGE_POP_SCALE,
  MULTIPLIER_BADGE_SCALE_DURATION,
  MULTIPLIER_BADGE_STYLE,
  MULTIPLIER_EFFECT_SCALE,
  MULTIPLIER_EFFECT_SPINE,
  MULTIPLIER_EFFECT_STATE,
} from '../../config/MultiplierBadgeConfig';
import { BOOST_BADGE_COPY_ALPHA } from '../../config/BoostConfig';
import { isSecondaryAssetsReady } from '../../models/JCAssetsState';
import { MYSTERY_SYMBOL_NAMES, SYMBOLS_DATA, getRandomSymbolName } from '../../config/SymbolsConfig';
import { appModel } from '@core/models/services/AppModelService';
import { MysteryReelResult } from './JCMysterySymbolModifier';
import JCReelSymbol from './JCReelSymbol';
import { JCReelSymbolPool } from './JCReelSymbolPool';
import { JCSymbolRigPool } from './JCSymbolRigPool';

// TODO: confirm 'animation' is the real state name in small_square's spine (guessed from transition's convention).
const SMALL_SQUARE_SPINE_NAME = 'small_square';
const SMALL_SQUARE_ANIM_STATE = 'animation';

// State names confirmed against Chain_lock_sym.json's own animations block.
const CHAIN_LOCK_SPINE_NAME = 'Chain_lock_sym';
const CHAIN_LOCK_APPEARING_STATE = 'appearing';
const CHAIN_LOCK_IDLE_STATE = 'idle';
const CHAIN_LOCK_DISAPPEARING_STATE = 'disappearing';

const ANTICIPATION_SCALE = 0.65;
const ANTICIPATION_Y = -23;
const CHAIN_LOCK_SCALE = 1.2;

const METAMORPHIC_REVEAL_DURATION = 0.25;
// Half the pop: it runs out and back.
const SYMBOL_POP_DURATION = 0.15;
const SYMBOL_POP_SCALE = 1.15;

// C5's handover into the mystery jackpot: one symbol shrinking away, another growing in.
const SYMBOL_TRANSFORM_DURATION = 0.2;
const SYMBOL_TRANSFORM_OUT_EASE = 'back.in(1.7)';
const SYMBOL_TRANSFORM_IN_EASE = 'power2.out';

const WIN_ANIMATION_PASSES = 2;

const LANDING_DIP_DURATION = 0.09;
const LANDING_RETURN_DURATION = 0.14;

const DIM_BRIGHTNESS = 0.2;
const DIM_FADE_DURATION = 0.2;

export interface HoldNWinReelConfig {
  row: number;
  column: number;
  symbolWidth: number;
  symbolHeight: number;
  // The row's shared masked layer, a sibling of this reel, that the strip moves into while spinning.
  spinLayer: Container;
  // How far past its stop a landing symbol dips before settling back, in px. Defaults to 0.
  landingOvershoot?: number;
  // Called whenever the cell takes a new symbol, however it got there.
  onSymbolPlaced?: () => void;
  // Scales every speed except windUpDistance, so stopMinSpeed stays <= spinMaxSpeed. Defaults to 1.
  spinSpeedMultiplier?: number;
  // How much slower an anticipating reel decelerates and creeps to its stop. Defaults to 0.35.
  anticipationSpeedFactor?: number;
}

type SpinPhase = 'idle' | 'windup' | 'spin' | 'stopping';

// A single Hold & Win cell: two symbols symbolHeight apart, swapped to fake an endless strip.
// Ignores spin()/stopSpin() while sticky or held.
export default class HoldNWinReel extends Container {
  public readonly row: number;
  public readonly column: number;
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly spinContainer: Container;
  private readonly spinLayer: Container;
  // Borrowed from the rig pool only while they play, and handed back after - see acquireEffect.
  private anticipationAnim: PixSpine | null = null;
  private chainLockAnim: PixSpine | null = null;
  private chainLockListener: any = null;
  private multiplierEffect: PixSpine | null = null;
  // 0 is the cell as drawn, 1 fully dimmed. A tint, not a filter: a filter is an offscreen pass per
  // cell every frame, where a tint multiplies the colour in the same draw - a brightness filter does
  // exactly that multiply. Spine and Text both honour a parent's tint.
  private readonly dimLevel = { value: 0 };
  private dimmed = false;
  private multiplierText: PixText | null = null;
  // How much of the badge's multiplier the symbol's figure already carries. A boost spends it
  // early, and the badge stays on, so what comes after multiplies only by what is left.
  private spentMultiplier = 1;
  private multiplierEffectListener: any = null;
  private sticky = false;
  // Distinct from sticky: a cell already holding a symbol sits out the respin rounds, with no lock
  // animation - it just doesn't take part.
  private held = false;
  // The strip is three symbols a cell apart: the one in the window, one above and one below. The
  // one below covers the bottom of the window while the strip winds up before it starts down;
  // with only two, that strip of the window showed empty.
  private symbolView: JCReelSymbol | null = null;
  private topSymbolView: JCReelSymbol | null = null;
  private bottomSymbolView: JCReelSymbol | null = null;

  private readonly windUpSpeed: number;
  private readonly windUpDistance: number;
  private readonly spinAccel: number;
  private readonly spinMaxSpeed: number;
  private readonly stopMinSpeed: number;
  private readonly anticipationSpeedFactor: number;
  private readonly landingOvershoot: number;
  private readonly onSymbolPlaced: (() => void) | undefined;

  private phase: SpinPhase = 'idle';
  private anticipating = false;
  private spinSpeed = 0;
  private pendingFinalSymbolName: string | null = null;
  private settlingSymbol: JCReelSymbol | null = null;
  private onSettled: (() => void) | null = null;

  constructor(config: HoldNWinReelConfig) {
    super();
    this.row = config.row;
    this.column = config.column;
    this.symbolWidth = config.symbolWidth;
    this.symbolHeight = config.symbolHeight;

    const speed = config.spinSpeedMultiplier ?? 1;
    this.windUpSpeed = this.symbolHeight * 0.035 * speed;
    this.windUpDistance = this.symbolHeight * 0.21;
    this.spinAccel = this.symbolHeight * 0.007 * speed;
    this.spinMaxSpeed = this.symbolHeight * 0.42 * speed;
    this.stopMinSpeed = this.symbolHeight * 0.35 * speed;
    this.anticipationSpeedFactor = config.anticipationSpeedFactor ?? 0.35;
    this.landingOvershoot = config.landingOvershoot ?? 0;
    this.onSymbolPlaced = config.onSymbolPlaced;

    this.spinContainer = new Container();
    this.spinContainer.label = 'spinContainer';
    this.addChild(this.spinContainer);
    this.spinLayer = config.spinLayer;

    this.topSymbolView = this.createStripNeighbour(-this.symbolHeight);
    this.bottomSymbolView = this.createStripNeighbour(this.symbolHeight);
  }

  // Offset by symbolHeight, not measured bounds - a mid-animation spine's bounds jitter. Hidden at
  // rest: only the window's own symbol shows while the cell is still.
  private createStripNeighbour(y: number): JCReelSymbol {
    const name = getRandomSymbolName();
    const symbol = JCReelSymbolPool.getInstance().acquire(name, this.column, this.row);
    this.applySymbolScale(symbol, SYMBOLS_DATA[name]?.cellScale, SYMBOLS_DATA[name]?.cellScaleY);
    symbol.y = y;
    symbol.visible = false;
    symbol.pauseWhileHidden();
    this.spinContainer.addChild(symbol);
    return symbol;
  }

  private stripSymbols(): JCReelSymbol[] {
    return [this.symbolView, this.topSymbolView, this.bottomSymbolView].filter(
      (symbol): symbol is JCReelSymbol => !!symbol,
    );
  }

  // A cell's effects exist only while they play: each is borrowed from the rig pool when needed and
  // handed back when done, so an idle cell carries none of them and nothing is rebuilt per use. On
  // the cell itself, never in spinContainer, so the spin mask cannot clip them; below the badge,
  // which the multiplier burst plays behind.
  private acquireEffect(spineName: string, label: string, scale: number): PixSpine {
    const effect = JCSymbolRigPool.getInstance().acquire({ spineName });
    effect.label = label;
    effect.scale.set(scale);
    effect.position.set(0, 0);
    const index = this.multiplierText ? this.getChildIndex(this.multiplierText) : this.children.length;
    this.addChildAt(effect, index);
    return effect;
  }

  // The pool stops it, drops its listeners, takes it off the ticker and out of this cell.
  private releaseEffect(effect: PixSpine | null): null {
    if (effect) JCSymbolRigPool.getInstance().release(effect);
    return null;
  }

  public getMultiplier(): number {
    return this.multiplierText ? Number(this.multiplierText.text.replace('x', '')) : 0;
  }

  private badgeRestX(): number {
    return this.symbolWidth / 2 - MULTIPLIER_BADGE_INSET.x;
  }

  private badgeRestY(): number {
    return -this.symbolHeight / 2 + MULTIPLIER_BADGE_INSET.y;
  }

  // Restored from an unfinished round: already earned, so no burst and no arrival animation.
  public setMultiplier(value: number): void {
    const badge = this.ensureMultiplierText();
    AnimationProxy.killTweensOf(badge);
    AnimationProxy.killTweensOf(badge.scale);
    badge.text = `x${value}`;
    badge.position.set(this.badgeRestX(), this.badgeRestY());
    badge.scale.set(1);
    badge.visible = true;
  }

  // Lands a new badge or updates an existing one. A repeat of the value on show is left alone.
  public showMultiplier(value: number, onComplete?: () => void): void {
    if (!this.multiplierText) {
      this.landMultiplier(value, onComplete);
      return;
    }
    if (this.getMultiplier() === value) {
      onComplete?.();
      return;
    }
    this.updateMultiplier(this.multiplierText, value, onComplete);
  }

  private landMultiplier(value: number, onComplete?: () => void): void {
    const badge = this.ensureMultiplierText();
    badge.text = `x${value}`;
    badge.position.set(0, 0);
    badge.scale.set(0);
    badge.visible = true;

    this.playMultiplierEffect();
    AnimationProxy.animateTween(badge.scale, {
      duration: MULTIPLIER_BADGE_ARRIVE_DURATION,
      x: 1,
      y: 1,
      ease: MULTIPLIER_BADGE_ARRIVE_EASE,
      onComplete: () => this.pulseArrival(badge, onComplete),
    });
  }

  private pulseArrival(badge: PixText, onComplete?: () => void): void {
    AnimationProxy.animateTween(badge.scale, {
      duration: MULTIPLIER_BADGE_PULSE_DURATION,
      x: MULTIPLIER_BADGE_PULSE_SCALE,
      y: MULTIPLIER_BADGE_PULSE_SCALE,
      ease: MULTIPLIER_BADGE_PULSE_EASE,
      repeat: MULTIPLIER_BADGE_PULSE_REPEAT,
      yoyo: true,
      onComplete: () => {
        AnimationProxy.animateTween(badge, {
          duration: MULTIPLIER_BADGE_MOVE_DURATION,
          delay: MULTIPLIER_BADGE_MOVE_DELAY,
          x: this.badgeRestX(),
          y: this.badgeRestY(),
          onComplete,
        });
      },
    });
  }

  // Update: the badge keeps its corner, swells with the burst behind it, takes the new value at
  // the peak and settles once the burst ends.
  private updateMultiplier(badge: PixText, value: number, onComplete?: () => void): void {
    let effectDone = false;
    let swellDone = false;
    const settle = () => {
      if (!effectDone || !swellDone) return;
      AnimationProxy.animateTween(badge.scale, {
        duration: MULTIPLIER_BADGE_SCALE_DURATION,
        x: 1,
        y: 1,
        onComplete,
      });
    };

    this.playMultiplierEffect(badge.position, () => {
      effectDone = true;
      settle();
    });
    AnimationProxy.animateTween(badge.scale, {
      duration: MULTIPLIER_BADGE_SCALE_DURATION,
      x: MULTIPLIER_BADGE_POP_SCALE,
      y: MULTIPLIER_BADGE_POP_SCALE,
      onComplete: () => {
        badge.text = `x${value}`;
        swellDone = true;
        settle();
      },
    });
  }

  // The badge spending itself on the symbol: in from the corner, down to nothing, and the cell's
  // figure climbs to what it is now worth - by whatever part of the multiplier is still unspent.
  public applyMultiplierToSymbol(onComplete?: () => void): void {
    const badge = this.multiplierText;
    const multiplier = this.getMultiplier();
    if (!badge || !multiplier) {
      onComplete?.();
      return;
    }
    const factor = multiplier / this.spentMultiplier;
    this.spendBadge(badge, () => {
      this.clearMultiplier();
      this.multiplySymbol(factor, onComplete);
    });
  }

  // The same spend for a boost, except the badge leaves a faded copy behind it in its corner, which
  // stays as the cell's badge - see settleBoostBadge. Straight through when nothing is left unspent.
  public spendMultiplierForBoost(onComplete?: () => void): void {
    const badge = this.multiplierText;
    const multiplier = this.getMultiplier();
    if (!badge || !multiplier || multiplier === this.spentMultiplier) {
      onComplete?.();
      return;
    }
    const factor = multiplier / this.spentMultiplier;
    this.spentMultiplier = multiplier;

    const copy = this.createBadgeText();
    copy.text = badge.text;
    copy.position.set(this.badgeRestX(), this.badgeRestY());
    copy.alpha = BOOST_BADGE_COPY_ALPHA;
    this.addChildAt(copy, this.getChildIndex(badge));
    this.multiplierText = copy;

    this.spendBadge(badge, () => {
      this.removeChild(badge);
      badge.destroy();
      this.multiplySymbol(factor, onComplete);
    });
  }

  // Once the boost has collected, the copy a spent badge left behind shows in full.
  public settleBoostBadge(): void {
    if (this.multiplierText) this.multiplierText.alpha = 1;
  }

  private spendBadge(badge: PixText, onSpent: () => void): void {
    AnimationProxy.killTweensOf(badge);
    AnimationProxy.killTweensOf(badge.scale);
    AnimationProxy.animateTween(badge, {
      duration: MULTIPLIER_APPLY_MOVE_DURATION,
      x: 0,
      y: 0,
      ease: MULTIPLIER_APPLY_MOVE_EASE,
      onComplete: () =>
        AnimationProxy.animateTween(badge.scale, {
          duration: MULTIPLIER_APPLY_SHRINK_DURATION,
          x: 0,
          y: 0,
          ease: MULTIPLIER_APPLY_SHRINK_EASE,
          onComplete: onSpent,
        }),
    });
  }

  private multiplySymbol(factor: number, onComplete?: () => void): void {
    const symbol = this.symbolView;
    if (!symbol) {
      onComplete?.();
      return;
    }
    symbol.applyMultiplier(factor, MULTIPLIER_APPLY_COUNT_DURATION, onComplete);
  }

  // A boost's figure climbing by what one collect trail brought it.
  public addBoostValue(amount: number, duration: number, onComplete?: () => void): void {
    if (!this.symbolView) {
      onComplete?.();
      return;
    }
    this.symbolView.addCollectValue(amount, duration, onComplete);
  }

  public playBoostCollect(): void {
    this.symbolView?.showCollect();
  }

  // Runs when the feature ends and on destroy: no tween, spine listener or text left behind.
  public clearMultiplier(): void {
    this.spentMultiplier = 1;
    this.releaseMultiplierEffectListener();
    this.multiplierEffect = this.releaseEffect(this.multiplierEffect);
    if (!this.multiplierText) return;
    AnimationProxy.killTweensOf(this.multiplierText);
    AnimationProxy.killTweensOf(this.multiplierText.scale);
    this.removeChild(this.multiplierText);
    this.multiplierText.destroy();
    this.multiplierText = null;
  }

  private releaseMultiplierEffectListener(): void {
    if (!this.multiplierEffectListener) return;
    this.multiplierEffect?.removeSpineEvent(this.multiplierEffectListener);
    this.multiplierEffectListener = null;
  }

  private ensureMultiplierText(): PixText {
    if (!this.multiplierText) {
      this.multiplierText = this.createBadgeText();
      this.addChild(this.multiplierText);
    }
    return this.multiplierText;
  }

  private createBadgeText(): PixText {
    const badge: PixText = UIUtil.getElement({
      name: 'multiplierBadge',
      type: 'Text',
      contentText: '',
      anchor: { x: 0.5, y: 0.5 },
      style: MULTIPLIER_BADGE_STYLE,
    });
    badge.label = 'multiplierBadge';
    return badge;
  }

  // Centred on the cell unless a position is given, which an updating badge uses to keep the
  // burst behind itself.
  private playMultiplierEffect(at?: { x: number; y: number }, onComplete?: () => void): void {
    // Its spine is feature art in SECONDARY; without it the badge just arrives with no burst.
    if (!isSecondaryAssetsReady()) {
      onComplete?.();
      return;
    }
    this.releaseMultiplierEffectListener();
    this.multiplierEffect ??= this.acquireEffect(MULTIPLIER_EFFECT_SPINE, 'multiplierEffect', MULTIPLIER_EFFECT_SCALE);
    const effect = this.multiplierEffect;
    this.multiplierEffectListener = effect.addEventListener('complete', () => {
      this.releaseMultiplierEffectListener();
      this.multiplierEffect = this.releaseEffect(this.multiplierEffect);
      onComplete?.();
    });
    effect.position.set(at?.x ?? 0, at?.y ?? 0);
    effect.playAnimation({ state: MULTIPLIER_EFFECT_STATE, loop: false });
  }

  // Swaps the cell to the symbol one step up the ladder and pops it, so the new face is what
  // swells. showSymbol releases the old instance back to the pool and kills its tweens, so nothing
  // is left holding the one that went.
  // The top rung is the exception: C5 changes symbol rather than tier, so it hands over instead.
  public chargeSymbol(name: string, onComplete?: () => void): void {
    if (MYSTERY_SYMBOL_NAMES.includes(name)) {
      this.transformSymbol(name, onComplete);
      return;
    }
    this.showSymbol(name);
    this.popSymbol(onComplete);
  }

  private transformSymbol(name: string, onComplete?: () => void): void {
    const outgoing = this.symbolView;
    if (!outgoing) {
      this.showSymbol(name);
      this.popSymbol(onComplete);
      return;
    }
    this.scaleSymbolOut(outgoing, () => this.scaleSymbolIn(name, onComplete));
  }

  private scaleSymbolOut(symbol: JCReelSymbol, onComplete: () => void): void {
    AnimationProxy.animateTween(symbol.scale, {
      duration: SYMBOL_TRANSFORM_DURATION,
      x: 0,
      y: 0,
      ease: SYMBOL_TRANSFORM_OUT_EASE,
      onComplete,
    });
  }

  // showSymbol releases the shrunken instance and kills the tween still on it, so nothing of the
  // old symbol goes back into the pool.
  private scaleSymbolIn(name: string, onComplete?: () => void): void {
    this.showSymbol(name);
    const symbol = this.symbolView;
    if (!symbol) {
      onComplete?.();
      return;
    }
    const restX = symbol.scale.x;
    const restY = symbol.scale.y;
    symbol.scale.set(0, 0);
    AnimationProxy.animateTween(symbol.scale, {
      duration: SYMBOL_TRANSFORM_DURATION,
      x: restX,
      y: restY,
      ease: SYMBOL_TRANSFORM_IN_EASE,
      onComplete: () => {
        symbol.scale.set(restX, restY);
        symbol.showLanding(() => {
          symbol.showIdle();
          onComplete?.();
        });
      },
    });
  }

  // Out and back on whatever the cell is holding. The rest scale is read now rather than cached:
  // symbols rest at different scales, as C5 does turning into the mystery jackpot.
  private popSymbol(onComplete?: () => void): void {
    const symbol = this.symbolView;
    if (!symbol) {
      onComplete?.();
      return;
    }
    const restX = symbol.scale.x;
    const restY = symbol.scale.y;
    AnimationProxy.animateTween(symbol.scale, {
      duration: SYMBOL_POP_DURATION,
      x: restX * SYMBOL_POP_SCALE,
      y: restY * SYMBOL_POP_SCALE,
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        symbol.scale.set(restX, restY);
        onComplete?.();
      },
    });
  }

  // One cell's whole reveal. The strip is already turning when this is called - see
  // startMysteryReels.
  public revealMysterySymbol(result: MysteryReelResult, symbolName: string, onComplete?: () => void): void {
    this.spinMysteryReel(result).then(() => {
      this.popSymbol(() => {
        const mystery = this.symbolView;
        if (!mystery) {
          onComplete?.();
          return;
        }
        // The badge goes with the mystery rather than hanging over the empty cell while it hides.
        this.clearMultiplier();
        mystery.showHiding(() => {
          this.showSymbol(symbolName);
          const revealed = this.symbolView;
          if (!revealed) {
            onComplete?.();
            return;
          }
          revealed.showLanding(() => {
            revealed.showIdle();
            onComplete?.();
          });
        });
      });
    });
  }

  // Straight away: the trail that brings the symbol in has already finished by the time the
  // caller gets here.
  public revealMetamorphicSymbol(name: string, onComplete?: () => void): void {
    this.showSymbol(name);
    const symbol = this.symbolView;
    const restScale = symbol.scale.x;
    symbol.scale.set(0);
    AnimationProxy.animateTween(symbol.scale, {
      duration: METAMORPHIC_REVEAL_DURATION,
      x: restScale,
      y: restScale,
      onComplete: () => {
        symbol.showIdle();
        onComplete?.();
      },
    });
  }

  // The bet comes from the model rather than the caller, so every cell formats against the same
  // one. No-op unless the cell holds a mystery symbol.
  public spinMysteryReel(result: MysteryReelResult, delayMs = 0): Promise<void> {
    return this.symbolView?.spinMysteryReel(result, appModel.getTotalBet(), delayMs) ?? Promise.resolve();
  }

  public startMysteryReel(delayMs = 0): void {
    this.symbolView?.startMysteryReel(appModel.getTotalBet(), delayMs);
  }

  public stopMysteryReel(): void {
    this.symbolView?.stopMysteryReel();
  }

  public isMysterySpinning(): boolean {
    return this.symbolView?.isMysteryReelSpinning() ?? false;
  }

  public setDimmed(flag: boolean): void {
    if (this.dimmed === flag) return;
    this.dimmed = flag;
    const level = this.dimLevel;
    AnimationProxy.animateTween(level, {
      duration: DIM_FADE_DURATION,
      value: flag ? 1 : 0,
      onUpdate: () => this.applyDim(level.value),
      onComplete: () => this.applyDim(level.value),
    });
  }

  // Grey, as tint takes it: each channel scaled the same, from 1 down to DIM_BRIGHTNESS.
  private applyDim(level: number): void {
    const channel = Math.round(255 * (1 - (1 - DIM_BRIGHTNESS) * level));
    this.tint = (channel << 16) | (channel << 8) | channel;
  }

  public playWinAnimation(onComplete?: () => void): void {
    const symbol = this.symbolView;
    if (!symbol) {
      onComplete?.();
      return;
    }
    this.playWinPass(symbol, WIN_ANIMATION_PASSES, onComplete);
  }

  private playWinPass(symbol: JCReelSymbol, remaining: number, onComplete?: () => void): void {
    if (remaining <= 0) {
      symbol.showIdle();
      onComplete?.();
      return;
    }
    symbol.showWinning(() => this.playWinPass(symbol, remaining - 1, onComplete), false);
  }

  public isSticky(): boolean {
    return this.sticky;
  }

  public isHeld(): boolean {
    return this.held;
  }

  public setHeld(flag: boolean): void {
    this.held = flag;
    // Nothing is going to scroll through this cell, so the window that trims a symbol to the cell
    // has no reason to stay on.
    if (flag) this.setSpinMasked(false);
  }

  // A spinning strip is drawn in its row's shared masked layer, so a row needs one mask instead of
  // one per cell. At rest it comes back into the cell unmasked, where an oversized symbol can spill
  // past it. The layer is a sibling with no transform of its own, so the cell's position carries over.
  private setSpinMasked(flag: boolean): void {
    if (flag) {
      if (this.spinContainer.parent === this.spinLayer) return;
      this.spinContainer.position.set(this.x, this.y);
      this.spinLayer.addChild(this.spinContainer);
      this.spinLayer.visible = true;
      return;
    }
    if (this.spinContainer.parent === this) return;
    this.spinContainer.position.set(0, 0);
    // Index 0: the cell's overlays were added after the strip and draw over it.
    this.addChildAt(this.spinContainer, 0);
    // A layer holding only its mask still pushes and pops the stencil every frame.
    this.spinLayer.visible = this.spinLayer.children.length > 1;
  }

  public setSticky(flag: boolean): void {
    this.sticky = flag;
  }

  public getSymbolName(): string | null {
    return this.symbolView?.getSymbolName() ?? null;
  }

  // In bet multiples, what this cell pays at the end of the feature.
  public getCollectValue(): number {
    return this.symbolView?.getCollectValue() ?? 0;
  }

  // The whole strip, not just the window's symbol - the neighbours are visible mid-spin.
  public refreshBlanksVisual(): void {
    this.stripSymbols().forEach((symbol) => symbol.refreshBlanksVisual());
  }

  public showSymbol(name: string): void {
    const pool = JCReelSymbolPool.getInstance();
    if (this.symbolView) {
      // scale is its own tween target, so killing the view alone leaves a pop or a reveal running
      // against an instance the pool has already handed to another cell.
      AnimationProxy.killTweensOf(this.symbolView);
      AnimationProxy.killTweensOf(this.symbolView.scale);
      pool.release(this.symbolView);
    }
    this.symbolView = pool.acquire(name, this.column, this.row);
    this.applySymbolScale(this.symbolView, SYMBOLS_DATA[name]?.cellScale, SYMBOLS_DATA[name]?.cellScaleY);
    this.symbolView.y = 0;
    this.spinContainer.addChild(this.symbolView);
    this.symbolView.showIdle();
    this.setSpinMasked(false);
    this.onSymbolPlaced?.();
  }

  // Reset to 1 first: pooled instances can carry a stale scale. A symbol with no cellScale is
  // auto-fitted; cellScaleY only matters where the two axes differ.
  private applySymbolScale(symbol: JCReelSymbol, cellScale?: number, cellScaleY?: number): void {
    symbol.scale.set(1);
    let appliedScale: number;
    if (cellScale != null) {
      appliedScale = cellScale;
    } else if (symbol.width === 0 || symbol.height === 0) {
      appliedScale = 1;
    } else {
      appliedScale = Math.min(this.symbolWidth / symbol.width, this.symbolHeight / symbol.height);
    }
    symbol.scale.set(appliedScale, cellScaleY ?? appliedScale);
  }

  public spin(): void {
    if (this.sticky || this.held || this.phase !== 'idle' || !this.symbolView) return;
    this.setSpinMasked(true);
    this.pendingFinalSymbolName = null;
    this.settlingSymbol = null;
    this.spinSpeed = 0;
    this.phase = 'windup';
    // A landing tween from the last stop would otherwise fight the strip.
    this.stripSymbols().forEach((symbol) => {
      AnimationProxy.killTweensOf(symbol);
      AnimationProxy.killTweensOf(symbol.scale);
      this.setSpinningVisual(symbol);
      symbol.visible = true;
    });
    // A spin cut into a landing dip leaves the window's symbol off zero, so the neighbours are
    // squared up against it rather than left wherever the dip put them.
    this.alignNeighbours(this.symbolView);
    Ticker.shared.add(this.onSpinTick, this);
  }

  // onSettled fires once the symbol reaches rest, not when stopSpin() is called.
  public stopSpin(finalSymbolName: string, onSettled?: () => void): void {
    if (this.sticky || this.held) return;
    if (this.phase === 'idle') {
      this.showSymbol(finalSymbolName);
      this.symbolView.showLanding(() => this.symbolView.showIdle());
      onSettled?.();
      return;
    }
    this.pendingFinalSymbolName = finalSymbolName;
    this.onSettled = onSettled ?? null;
    this.phase = 'stopping';
  }

  private setSpinningVisual(symbol: JCReelSymbol): void {
    symbol.setBlurredTexture();
    symbol.setBlanksBlurred(true);
  }

  // Every symbol on the strip was blurred as the spin started and keeps it through setNewSymbol(),
  // which plays the blur pose itself - playing it a second time here was a second full pose a recycle.
  private setSymbolContentForSpin(symbol: JCReelSymbol, name: string): void {
    symbol.setNewSymbol({ ...SYMBOLS_DATA[name], row: this.row }, this.column);
    this.applySymbolScale(symbol, SYMBOLS_DATA[name]?.cellScale, SYMBOLS_DATA[name]?.cellScaleY);
    // Blanks keeps its blur on a skin of its own, which placing a new symbol resets.
    symbol.setBlanksBlurred(true);
  }

  private onSpinTick(ticker: Ticker): void {
    if (!this.symbolView) return;
    const delta = ticker.deltaTime;
    switch (this.phase) {
      case 'windup':
        this.stripSymbols().forEach((symbol) => (symbol.y -= this.windUpSpeed * delta));
        if (this.symbolView.y <= -this.windUpDistance) {
          this.phase = 'spin';
        }
        break;
      case 'spin':
        this.spinSpeed = Math.min(this.spinSpeed + this.spinAccel * delta, this.spinMaxSpeed);
        this.advance(this.spinSpeed * delta);
        break;
      case 'stopping': {
        // Anticipating reels ease off more gently and creep in at a lower floor speed, which is
        // what stretches the stop out.
        const factor = this.anticipating ? this.anticipationSpeedFactor : 1;
        this.spinSpeed = Math.max(this.spinSpeed - this.spinAccel * factor * delta, this.stopMinSpeed * factor);
        this.advance(this.spinSpeed * delta);
        this.checkSettle();
        break;
      }
      default:
        break;
    }
  }

  private advance(distance: number): void {
    const strip = this.stripSymbols();
    strip.forEach((symbol) => (symbol.y += distance));
    strip.forEach((symbol) => this.recycleIfNeeded(symbol));
  }

  // Wrapped by the strip's length rather than snapped to a fixed y: at these speeds a symbol
  // crosses the threshold mid-step, and dropping that overshoot would change the spacing between
  // the symbols on every wrap. Wrapped once it is half a cell past the slot below the window, so
  // the strip always reaches at least half a cell beyond the window at both ends.
  private recycleIfNeeded(symbol: JCReelSymbol): void {
    if (symbol === this.settlingSymbol) return;
    if (symbol.y < this.symbolHeight * 1.5) return;
    symbol.y -= this.symbolHeight * 3;
    this.setSymbolContentForSpin(symbol, getRandomSymbolName());
  }

  // The next one to arrive in the window - the lowest of those not yet past it - takes the final
  // result. With the strip a cell apart there is exactly one in (-symbolHeight, 0].
  private checkSettle(): void {
    if (this.pendingFinalSymbolName && !this.settlingSymbol) {
      const front = this.stripSymbols()
        .filter((symbol) => symbol.y <= 0)
        .reduce((lowest, symbol) => (symbol.y > lowest.y ? symbol : lowest));
      this.setSymbolContentForSpin(front, this.pendingFinalSymbolName);
      this.settlingSymbol = front;
      this.pendingFinalSymbolName = null;
    }
    if (this.settlingSymbol && this.settlingSymbol.y >= 0) {
      this.finishSettle(this.settlingSymbol);
    }
  }

  private finishSettle(front: JCReelSymbol): void {
    Ticker.shared.remove(this.onSpinTick, this);
    this.phase = 'idle';
    this.settlingSymbol = null;
    this.setAnticipating(false);

    // The other two become its neighbours, above and below by position. They stay visible for the
    // landing dip - see playLanding - and are hidden once the cell is at rest.
    const [above, below] = this.stripSymbols()
      .filter((symbol) => symbol !== front)
      .sort((a, b) => a.y - b.y);
    this.symbolView = front;
    this.topSymbolView = above;
    this.bottomSymbolView = below;
    this.alignNeighbours(front);
    this.onSymbolPlaced?.();

    // Blanks has no landing animation to clear the blur for it.
    front.setBlanksBlurred(false);

    const onSettled = this.onSettled;
    this.onSettled = null;
    this.playLanding(front, onSettled);
  }

  // Carries on past the stop position and rides back up to it, rather than snapping to 0 from
  // wherever the symbol happened to cross it. The cell stays masked until it comes to rest, so the
  // dip reads as movement behind the window rather than a symbol hanging out of it.
  //
  // The neighbours ride the dip with it, so the symbol above fills the top of the window while the
  // front is pushed down, rather than the window showing empty there.
  private playLanding(front: JCReelSymbol, onSettled: (() => void) | null): void {
    if (!this.landingOvershoot) {
      front.y = 0;
      this.restAtFront(front);
      front.showLanding(() => front.showIdle());
      onSettled?.();
      return;
    }
    const follow = (): void => this.alignNeighbours(front);
    AnimationProxy.animateTween(front, {
      duration: LANDING_DIP_DURATION,
      y: this.landingOvershoot,
      onUpdate: follow,
      onComplete: () => {
        front.showLanding(() => front.showIdle());
        AnimationProxy.animateTween(front, {
          duration: LANDING_RETURN_DURATION,
          y: 0,
          onUpdate: follow,
          onComplete: () => {
            this.restAtFront(front);
            onSettled?.();
          },
        });
      },
    });
  }

  private alignNeighbours(front: JCReelSymbol | null): void {
    if (!front) return;
    if (this.topSymbolView) this.topSymbolView.y = front.y - this.symbolHeight;
    if (this.bottomSymbolView) this.bottomSymbolView.y = front.y + this.symbolHeight;
  }

  // At rest only the window's symbol shows: the cell comes out of the mask, where a neighbour would
  // otherwise draw outside it.
  private restAtFront(front: JCReelSymbol): void {
    this.alignNeighbours(front);
    [this.topSymbolView, this.bottomSymbolView].forEach((neighbour) => {
      if (!neighbour) return;
      neighbour.visible = false;
      neighbour.pauseWhileHidden();
    });
    this.setSpinMasked(false);
  }

  // Turned on while the reel is still spinning, and cleared by finishSettle().
  public setAnticipating(flag: boolean): void {
    this.anticipating = flag;
    this.setSmallSquareVisible(flag);
  }

  public isAnticipating(): boolean {
    return this.anticipating;
  }

  public setSmallSquareVisible(flag: boolean): void {
    if (!flag) {
      this.anticipationAnim = this.releaseEffect(this.anticipationAnim);
      return;
    }
    this.anticipationAnim ??= this.acquireEffect(SMALL_SQUARE_SPINE_NAME, 'anticipationAnim', ANTICIPATION_SCALE);
    this.anticipationAnim.y = ANTICIPATION_Y;
    this.anticipationAnim.playAnimation({ state: SMALL_SQUARE_ANIM_STATE, loop: true });
  }

  // nextState queues idle on the spine track, so no JS completion handling is needed here.
  public playChainLockAppear(): void {
    if (!this.sticky) return;
    // A lock coming back before the last one finished coming apart keeps the same rig, so the
    // pending hand-back is cancelled rather than letting it take the rig away mid-lock.
    this.releaseChainLockListener();
    this.chainLockAnim ??= this.acquireEffect(CHAIN_LOCK_SPINE_NAME, 'chainLockAnim', CHAIN_LOCK_SCALE);
    this.chainLockAnim.playAnimation({
      state: CHAIN_LOCK_APPEARING_STATE,
      loop: false,
      nextState: CHAIN_LOCK_IDLE_STATE,
      nextLoop: true,
    });
  }

  // The flag goes now, not when the animation ends: a cell released by a bet or line change has to
  // be free the moment the player can press spin, and the chain coming apart is only the picture
  // of it.
  public playChainLockDisappear(): void {
    this.setSticky(false);
    const lock = this.chainLockAnim;
    if (!lock) return;
    this.releaseChainLockListener();
    this.chainLockListener = lock.addEventListener('complete', () => {
      this.releaseChainLockListener();
      this.chainLockAnim = this.releaseEffect(this.chainLockAnim);
    });
    lock.playAnimation({ state: CHAIN_LOCK_DISAPPEARING_STATE, loop: false });
  }

  private releaseChainLockListener(): void {
    if (!this.chainLockListener) return;
    this.chainLockAnim?.removeSpineEvent(this.chainLockListener);
    this.chainLockListener = null;
  }

  public destroy(options?: any): void {
    Ticker.shared.remove(this.onSpinTick, this);
    this.clearMultiplier();
    this.releaseChainLockListener();
    this.chainLockAnim = this.releaseEffect(this.chainLockAnim);
    this.anticipationAnim = this.releaseEffect(this.anticipationAnim);
    // Killed before the symbols go back: a landing tween finishing later would move a symbol some
    // other cell owns by then, and rest a reel that no longer exists.
    this.stripSymbols().forEach((symbol) => {
      AnimationProxy.killTweensOf(symbol);
      AnimationProxy.killTweensOf(symbol.scale);
      JCReelSymbolPool.getInstance().release(symbol);
    });
    this.symbolView = null;
    this.topSymbolView = null;
    this.bottomSymbolView = null;
    AnimationProxy.killTweensOf(this.dimLevel);
    // Back under this cell, or a destroy() of the cell would leave it behind in the row layer.
    this.setSpinMasked(false);
    super.destroy(options);
  }
}
