import { Container, Ticker } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import {
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
import { SYMBOLS_DATA, getRandomSymbolName } from '../../config/SymbolsConfig';
import { appModel } from '@core/models/services/AppModelService';
import { MysteryReelResult } from './JCMysterySymbolModifier';
import JCReelSymbol from './JCReelSymbol';
import { JCReelSymbolPool } from './JCReelSymbolPool';

// TODO: confirm 'animation' is the real state name in small_square's spine (guessed from transition's convention).
const SMALL_SQUARE_SPINE_NAME = 'small_square';
const SMALL_SQUARE_ANIM_STATE = 'animation';

// State names confirmed against Chain_lock_sym.json's own animations block.
const CHAIN_LOCK_SPINE_NAME = 'Chain_lock_sym';
const CHAIN_LOCK_APPEARING_STATE = 'appearing';
const CHAIN_LOCK_IDLE_STATE = 'idle';
const CHAIN_LOCK_DISAPPEARING_STATE = 'disappearing';

const METAMORPHIC_REVEAL_DURATION = 0.25;
// Half the pop: it runs out and back.
const CHARGE_POP_DURATION = 0.15;
const CHARGE_POP_SCALE = 1.15;

const WIN_ANIMATION_PASSES = 2;

const LANDING_DIP_DURATION = 0.09;
const LANDING_RETURN_DURATION = 0.14;

export interface HoldNWinReelConfig {
  row: number;
  column: number;
  symbolWidth: number;
  symbolHeight: number;
  // How much of the cell the spin mask shows. Defaults to symbolHeight.
  maskHeight?: number;
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
  private readonly maskShape: PixGraphics;
  private readonly smallSquareAnim: PixSpine;
  private readonly chainLockAnim: PixSpine;
  private readonly multiplierEffect: PixSpine;
  private multiplierText: PixText | null = null;
  private multiplierEffectListener: any = null;
  private sticky = false;
  // Distinct from sticky: a cell already holding a symbol sits out the respin rounds, with no lock
  // animation - it just doesn't take part.
  private held = false;
  private symbolView: JCReelSymbol | null = null;
  private topSymbolView: JCReelSymbol | null = null;

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

    // Only applied while spinning - a spine's bbox can bleed past the cell mid-animation.
    const maskHeight = config.maskHeight ?? this.symbolHeight;
    this.maskShape = UIUtil.getRectangle(
      this.symbolWidth,
      maskHeight,
      0xff0000,
      -this.symbolWidth / 2,
      -maskHeight / 2,
    );
    this.maskShape.label = 'spinMask';
    this.maskShape.alpha = 0;
    this.spinContainer.addChild(this.maskShape);

    // Offset by symbolHeight, not measured bounds - a mid-animation spine's bounds jitter.
    const topSymbolName = getRandomSymbolName();
    this.topSymbolView = JCReelSymbolPool.getInstance().acquire(topSymbolName, this.column, this.row);
    this.applySymbolScale(
      this.topSymbolView,
      SYMBOLS_DATA[topSymbolName]?.cellScale,
      SYMBOLS_DATA[topSymbolName]?.cellScaleY,
    );
    this.topSymbolView.y = -this.symbolHeight;
    this.topSymbolView.visible = false;
    this.spinContainer.addChild(this.topSymbolView);

    // Outside spinContainer so the spin mask never clips it.
    this.smallSquareAnim = UIUtil.getSpineAnim(SMALL_SQUARE_SPINE_NAME, { spineName: SMALL_SQUARE_SPINE_NAME });
    this.smallSquareAnim.label = 'anticipationAnim';
    this.smallSquareAnim.visible = false;
    this.smallSquareAnim.scale.set(0.65);
    this.smallSquareAnim.y = -23;
    this.addChild(this.smallSquareAnim);

    this.chainLockAnim = UIUtil.getSpineAnim(CHAIN_LOCK_SPINE_NAME, { spineName: CHAIN_LOCK_SPINE_NAME });
    this.chainLockAnim.label = 'chainLockAnim';
    this.chainLockAnim.visible = false;
    this.chainLockAnim.scale.set(1.2);
    this.addChild(this.chainLockAnim);

    this.multiplierEffect = UIUtil.getSpineAnim(MULTIPLIER_EFFECT_SPINE, { spineName: MULTIPLIER_EFFECT_SPINE });
    this.multiplierEffect.label = 'multiplierEffect';
    this.multiplierEffect.visible = false;
    this.multiplierEffect.label = 'multiplierEffect';
    this.multiplierEffect.scale.set(MULTIPLIER_EFFECT_SCALE);
    this.addChild(this.multiplierEffect);
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

  // Runs when the feature ends and on destroy: no tween, spine listener or text left behind.
  public clearMultiplier(): void {
    this.releaseMultiplierEffectListener();
    this.multiplierEffect.stopAnimation();
    this.multiplierEffect.visible = false;
    if (!this.multiplierText) return;
    AnimationProxy.killTweensOf(this.multiplierText);
    AnimationProxy.killTweensOf(this.multiplierText.scale);
    this.removeChild(this.multiplierText);
    this.multiplierText.destroy();
    this.multiplierText = null;
  }

  private releaseMultiplierEffectListener(): void {
    if (!this.multiplierEffectListener) return;
    this.multiplierEffect.removeSpineEvent(this.multiplierEffectListener);
    this.multiplierEffectListener = null;
  }

  private ensureMultiplierText(): PixText {
    if (!this.multiplierText) {
      this.multiplierText = UIUtil.getElement({
        name: 'multiplierBadge',
        type: 'Text',
        contentText: '',
        anchor: { x: 0.5, y: 0.5 },
        style: MULTIPLIER_BADGE_STYLE,
      });
      this.multiplierText.label = 'multiplierBadge';
      this.addChild(this.multiplierText);
    }
    return this.multiplierText;
  }

  // Centred on the cell unless a position is given, which an updating badge uses to keep the
  // burst behind itself.
  private playMultiplierEffect(at?: { x: number; y: number }, onComplete?: () => void): void {
    this.releaseMultiplierEffectListener();
    this.multiplierEffectListener = this.multiplierEffect.addEventListener('complete', () => {
      this.releaseMultiplierEffectListener();
      this.multiplierEffect.visible = false;
      onComplete?.();
    });
    this.multiplierEffect.position.set(at?.x ?? 0, at?.y ?? 0);
    this.multiplierEffect.visible = true;
    this.multiplierEffect.playAnimation({ state: MULTIPLIER_EFFECT_STATE, loop: false });
  }

  // Swaps the cell to the symbol one step up the ladder and pops it, so the new face is what
  // swells. showSymbol releases the old instance back to the pool and kills its tweens, so nothing
  // is left holding the one that went.
  public chargeSymbol(name: string, onComplete?: () => void): void {
    this.showSymbol(name);
    const symbol = this.symbolView;
    if (!symbol) {
      onComplete?.();
      return;
    }
    // Read after the swap: the new symbol may rest at a different scale, as C5 does turning into
    // the mystery jackpot.
    const restX = symbol.scale.x;
    const restY = symbol.scale.y;
    AnimationProxy.animateTween(symbol.scale, {
      duration: CHARGE_POP_DURATION,
      x: restX * CHARGE_POP_SCALE,
      y: restY * CHARGE_POP_SCALE,
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        symbol.scale.set(restX, restY);
        onComplete?.();
      },
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
    if (flag) this.spinContainer.mask = null;
  }

  public setSticky(flag: boolean): void {
    this.sticky = flag;
  }

  public getSymbolName(): string | null {
    return this.symbolView?.getSymbolName() ?? null;
  }

  // Both are refreshed - topSymbolView can be visible mid-spin.
  public refreshBlanksVisual(): void {
    this.symbolView?.refreshBlanksVisual();
    this.topSymbolView?.refreshBlanksVisual();
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
    this.spinContainer.mask = null;
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
    if (this.sticky || this.held || this.phase !== 'idle' || !this.symbolView || !this.topSymbolView) return;
    this.spinContainer.mask = this.maskShape;
    this.pendingFinalSymbolName = null;
    this.settlingSymbol = null;
    this.spinSpeed = 0;
    this.phase = 'windup';
    // A landing tween from the last stop would otherwise fight the strip.
    AnimationProxy.killTweensOf(this.symbolView);
    AnimationProxy.killTweensOf(this.symbolView.scale);
    AnimationProxy.killTweensOf(this.topSymbolView);
    AnimationProxy.killTweensOf(this.topSymbolView.scale);
    this.setSpinningVisual(this.symbolView);
    this.setSpinningVisual(this.topSymbolView);
    this.topSymbolView.visible = true;
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

  // setNewSymbol() tears the spine down; setBlurredTexture() rebuilds it so the cell isn't blank.
  private setSymbolContentForSpin(symbol: JCReelSymbol, name: string): void {
    symbol.setNewSymbol({ ...SYMBOLS_DATA[name], row: this.row }, this.column);
    this.applySymbolScale(symbol, SYMBOLS_DATA[name]?.cellScale, SYMBOLS_DATA[name]?.cellScaleY);
    symbol.setBlurredTexture();
  }

  private onSpinTick(ticker: Ticker): void {
    if (!this.symbolView || !this.topSymbolView) return;
    const delta = ticker.deltaTime;
    switch (this.phase) {
      case 'windup':
        this.symbolView.y -= this.windUpSpeed * delta;
        this.topSymbolView.y -= this.windUpSpeed * delta;
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
    this.symbolView.y += distance;
    this.topSymbolView.y += distance;
    this.recycleIfNeeded(this.symbolView);
    this.recycleIfNeeded(this.topSymbolView);
  }

  // Wrapped by the strip's length rather than snapped to a fixed y: at these speeds a symbol
  // crosses the threshold mid-step, and dropping that overshoot would change the gap between the
  // two symbols on every wrap.
  private recycleIfNeeded(symbol: JCReelSymbol): void {
    if (symbol === this.settlingSymbol) return;
    if (symbol.y < this.symbolHeight) return;
    symbol.y -= this.symbolHeight * 2;
    this.setSymbolContentForSpin(symbol, getRandomSymbolName());
  }

  // Exactly one of the two symbols has y <= 0 at a time; that one takes the final result.
  private checkSettle(): void {
    if (this.pendingFinalSymbolName && !this.settlingSymbol) {
      const front = this.symbolView.y <= 0 ? this.symbolView : this.topSymbolView;
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

    const back = front === this.symbolView ? this.topSymbolView : this.symbolView;
    back.visible = false;
    back.y = -this.symbolHeight;
    this.symbolView = front;
    this.topSymbolView = back;
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
  private playLanding(front: JCReelSymbol, onSettled: (() => void) | null): void {
    if (!this.landingOvershoot) {
      front.y = 0;
      this.spinContainer.mask = null;
      front.showLanding(() => front.showIdle());
      onSettled?.();
      return;
    }
    AnimationProxy.animateTween(front, {
      duration: LANDING_DIP_DURATION,
      y: this.landingOvershoot,
      onComplete: () => {
        front.showLanding(() => front.showIdle());
        AnimationProxy.animateTween(front, {
          duration: LANDING_RETURN_DURATION,
          y: 0,
          onComplete: () => {
            this.spinContainer.mask = null;
            onSettled?.();
          },
        });
      },
    });
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
    if (flag) {
      this.smallSquareAnim.visible = true;
      this.smallSquareAnim.playAnimation({ state: SMALL_SQUARE_ANIM_STATE, loop: true });
    } else {
      this.smallSquareAnim.stopAnimation();
      this.smallSquareAnim.visible = false;
    }
  }

  // nextState queues idle on the spine track, so no JS completion handling is needed here.
  public playChainLockAppear(): void {
    if (!this.sticky) return;
    this.chainLockAnim.visible = true;
    this.chainLockAnim.playAnimation({
      state: CHAIN_LOCK_APPEARING_STATE,
      loop: false,
      nextState: CHAIN_LOCK_IDLE_STATE,
      nextLoop: true,
    });
  }

  public playChainLockDisappear(): void {
    const listener = this.chainLockAnim.addEventListener('complete', () => {
      if (listener) this.chainLockAnim.removeSpineEvent(listener);
      this.chainLockAnim.visible = false;
      this.setSticky(false);
    });
    this.chainLockAnim.playAnimation({ state: CHAIN_LOCK_DISAPPEARING_STATE, loop: false });
  }

  public destroy(options?: any): void {
    Ticker.shared.remove(this.onSpinTick, this);
    this.clearMultiplier();
    if (this.symbolView) {
      JCReelSymbolPool.getInstance().release(this.symbolView);
      this.symbolView = null;
    }
    if (this.topSymbolView) {
      JCReelSymbolPool.getInstance().release(this.topSymbolView);
      this.topSymbolView = null;
    }
    this.spinContainer.mask = null;
    super.destroy(options);
  }
}
