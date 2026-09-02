import { Container, Ticker } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Elastic } from 'gsap/gsap-core';
import { SYMBOLS_DATA, getRandomSymbolName } from '../../config/SymbolsConfig';
import JCReelSymbol from './JCReelSymbol';
import { JCReelSymbolPool } from './JCReelSymbolPool';

export interface HoldNWinReelConfig {
  row: number;
  column: number;
  symbolWidth: number;
  symbolHeight: number;
}

type SpinPhase = 'idle' | 'windup' | 'spin' | 'stopping';

// Same bounce corelib's own SlotReel uses for its final "jerk" into place (see
// SlotReel.ts's customEase / showFinalJerk).
const SETTLE_EASE = Elastic.easeOut.config(1.4, 0.6);
const SETTLE_DURATION = 0.6;

// One position in a Hold & Win grid. Unlike a normal reel there's no strip scrolling behind it -
// each position only ever shows a single symbol at a time. To still get a real "spinning reel"
// look, this uses the same two symbols as everything else here (symbolView + topSymbolView,
// exactly symbolHeight apart) as a minimal 2-symbol version of corelib's own SlotReel technique
// (see moveReelUp/doSpinning/stoppingReelStrip/showFinalJerk in SlotReel.ts): both move down
// together, and whichever one scrolls fully past the cell gets recycled back above with a new
// random symbol, so it reads as an endless strip using only two objects.
// Once locked ("sticky"), a position keeps its symbol for the rest of the feature and ignores
// further spin()/stopSpin() calls until explicitly un-stuck via setSticky(false).
export default class HoldNWinReel extends Container {
  public readonly row: number;
  public readonly column: number;
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly maskShape: PixGraphics;
  private sticky = false;
  private symbolView: JCReelSymbol | null = null;
  private topSymbolView: JCReelSymbol | null = null;

  // Speeds/distances below are ratios lifted from corelib's SlotReel (movingUpSpeed / maxUpY /
  // speedFactor / maxSpeed / minSpeed / maxDownY) rescaled against this cell's own symbolHeight,
  // rather than copying its raw pixel values (tuned for a much taller multi-row reel strip).
  private readonly windUpSpeed: number;
  private readonly windUpDistance: number;
  private readonly spinAccel: number;
  private readonly spinMaxSpeed: number;
  private readonly stopMinSpeed: number;
  private readonly overshootThreshold: number;

  private phase: SpinPhase = 'idle';
  private spinSpeed = 0;
  // Set by stopSpin(); consumed the next time a symbol is available to receive it (see
  // checkSettle()) - not necessarily symbolView, since spinning may have swapped which of the
  // two objects is currently the one approaching the resting slot.
  private pendingFinalSymbolName: string | null = null;
  // The symbol currently carrying the final result and being watched for reaching rest.
  private settlingSymbol: JCReelSymbol | null = null;

  constructor(config: HoldNWinReelConfig) {
    super();
    this.row = config.row;
    this.column = config.column;
    this.symbolWidth = config.symbolWidth;
    this.symbolHeight = config.symbolHeight;

    this.windUpSpeed = this.symbolHeight * 0.035;
    this.windUpDistance = this.symbolHeight * 0.21;
    this.spinAccel = this.symbolHeight * 0.007;
    this.spinMaxSpeed = this.symbolHeight * 0.42;
    this.stopMinSpeed = this.symbolHeight * 0.35;
    this.overshootThreshold = this.symbolHeight * 0.14;

    // Clips whatever's shown to this cell's bounds - symbols are scaled to fit (see
    // applySymbolScale) but a spine's bounding box can still stick out slightly during an
    // animation, and this keeps that from bleeding into neighboring cells. Only actually applied
    // (this.mask = maskShape) while spin() is running - see spin()/showSymbol().
    this.maskShape = UIUtil.getRectangle(
      this.symbolWidth,
      this.symbolHeight,
      0xff0000,
      -this.symbolWidth / 2,
      -this.symbolHeight / 2,
    );
    this.maskShape.alpha = 0;
    this.addChild(this.maskShape);

    // Height comes from symbolHeight (the cell's fixed, configured size that the static image is
    // fit to) rather than measuring whatever's currently on screen - a mid-animation spine's
    // bounds can vary, which would make this jitter instead of sitting at a fixed one-cell offset.
    const topSymbolName = getRandomSymbolName();
    this.topSymbolView = JCReelSymbolPool.getInstance().acquire(topSymbolName, this.column);
    this.applySymbolScale(this.topSymbolView, SYMBOLS_DATA[topSymbolName]?.cellScale);
    this.topSymbolView.y = -this.symbolHeight;
    this.topSymbolView.visible = false;
    this.addChild(this.topSymbolView);
  }

  public isSticky(): boolean {
    return this.sticky;
  }

  public setSticky(flag: boolean): void {
    this.sticky = flag;
  }

  public getSymbolName(): string | null {
    return this.symbolView?.getSymbolName() ?? null;
  }

  // Low-level "just display this" - doesn't check sticky, unlike spin()/stopSpin() below. Enters
  // idle right away so a shown symbol never just sits there static - "spinning" (blurred, no
  // spine) only ever happens while spin() below is actually running. Masking is only needed
  // while spinning (see spin()) - not idle/landed, so it's removed here.
  public showSymbol(name: string): void {
    const pool = JCReelSymbolPool.getInstance();
    if (this.symbolView) {
      pool.release(this.symbolView);
    }
    this.symbolView = pool.acquire(name, this.column);
    this.applySymbolScale(this.symbolView, SYMBOLS_DATA[name]?.cellScale);
    this.symbolView.y = 0;
    this.addChild(this.symbolView);
    this.symbolView.showIdle();
    this.mask = null;
  }

  // Symbols come back at their native texture size (bag_collect, bonus_sym, mystery_static, etc.
  // are all different pixel sizes). With an explicit cellScale (see SymbolsConfig.ts), that's
  // applied directly as a fixed, absolute scale - no auto-fit math involved, so it reads the same
  // regardless of this cell's dimensions. Without one, it falls back to auto-fitting inside
  // symbolWidth x symbolHeight, preserving aspect ratio. Instances are pooled and reused across
  // different symbol names, so the scale is reset to 1 first - otherwise a leftover scale from
  // whatever this instance last displayed would throw off the width/height measurement in the
  // auto-fit path.
  private applySymbolScale(symbol: JCReelSymbol, cellScale?: number): void {
    symbol.scale.set(1);
    let appliedScale: number;
    if (cellScale != null) {
      appliedScale = cellScale;
    } else if (symbol.width === 0 || symbol.height === 0) {
      appliedScale = 1;
    } else {
      appliedScale = Math.min(this.symbolWidth / symbol.width, this.symbolHeight / symbol.height);
    }
    symbol.scale.set(appliedScale);
  }

  // Starts the spin: both symbols blur immediately (see setSpinningVisual), then this ticks
  // through windup (a brief move up, like winding up before the drop) -> spin (accelerate
  // downward, recycling whichever symbol scrolls past the cell) until stopSpin() moves it into
  // the stopping phase.
  public spin(): void {
    if (this.sticky || this.phase !== 'idle' || !this.symbolView || !this.topSymbolView) return;
    this.mask = this.maskShape;
    this.pendingFinalSymbolName = null;
    this.settlingSymbol = null;
    this.spinSpeed = 0;
    this.phase = 'windup';
    this.setSpinningVisual(this.symbolView);
    this.setSpinningVisual(this.topSymbolView);
    this.topSymbolView.visible = true;
    Ticker.shared.add(this.onSpinTick, this);
  }

  // Doesn't stop immediately - hands off the final symbol to whichever of the two objects is
  // next to arrive at the resting slot (see checkSettle()), lets it keep scrolling down into
  // place, then eases it the rest of the way to exactly (0,0) with the same bounce corelib's
  // reels use, and only then calls showLanding()/re-idles.
  public stopSpin(finalSymbolName: string): void {
    if (this.sticky) return;
    if (this.phase === 'idle') {
      // spin() was never actually running for this position - just show the result directly.
      this.showSymbol(finalSymbolName);
      this.symbolView.showLanding();
      return;
    }
    this.pendingFinalSymbolName = finalSymbolName;
    this.phase = 'stopping';
  }

  private setSpinningVisual(symbol: JCReelSymbol): void {
    symbol.resetSymbol();
    symbol.setBlurredTexture();
  }

  private setSymbolContentForSpin(symbol: JCReelSymbol, name: string): void {
    symbol.setNewSymbol(SYMBOLS_DATA[name], this.column);
    this.applySymbolScale(symbol, SYMBOLS_DATA[name]?.cellScale);
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
      case 'stopping':
        this.spinSpeed = Math.max(this.spinSpeed - this.spinAccel * delta, this.stopMinSpeed);
        this.advance(this.spinSpeed * delta);
        this.checkSettle();
        break;
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

  // Once a symbol has scrolled fully past the cell (y reaches +symbolHeight), it wraps back to
  // -symbolHeight and gets swapped to a new random symbol - the two objects are always exactly
  // symbolHeight apart, so this alone is what makes it read as an endless strip of symbols.
  private recycleIfNeeded(symbol: JCReelSymbol): void {
    if (symbol === this.settlingSymbol) return;
    if (symbol.y < this.symbolHeight) return;
    symbol.y = -this.symbolHeight;
    this.setSymbolContentForSpin(symbol, getRandomSymbolName());
  }

  // Whichever symbol currently has y <= 0 is the one approaching the resting slot next (the two
  // are always symbolHeight apart, so exactly one of them satisfies this at a time) - that's the
  // one that receives the final result. Once it's carried far enough past 0 to read as a real
  // "arrival" (overshootThreshold), hand off to the settle tween.
  private checkSettle(): void {
    if (this.pendingFinalSymbolName && !this.settlingSymbol) {
      const front = this.symbolView.y <= 0 ? this.symbolView : this.topSymbolView;
      front.setNormalTexture();
      this.setSymbolContentForSpin(front, this.pendingFinalSymbolName);
      this.settlingSymbol = front;
      this.pendingFinalSymbolName = null;
    }
    if (this.settlingSymbol && this.settlingSymbol.y >= this.overshootThreshold) {
      this.finishSettle(this.settlingSymbol);
    }
  }

  private finishSettle(front: JCReelSymbol): void {
    Ticker.shared.remove(this.onSpinTick, this);
    this.phase = 'idle';
    this.settlingSymbol = null;

    const back = front === this.symbolView ? this.topSymbolView : this.symbolView;
    back.visible = false;
    back.y = -this.symbolHeight;
    back.setNormalTexture();
    this.symbolView = front;
    this.topSymbolView = back;
    this.mask = null;

    AnimationProxy.animateTween(front, {
      y: 0,
      duration: SETTLE_DURATION,
      ease: SETTLE_EASE,
      onComplete: () => front.showLanding(),
    });
  }

  // Visual cue only - HoldNWinReelsContainer decides *when* a position should call these, since
  // that depends on grid-wide state (how many positions are still open, respins remaining) this
  // single reel has no visibility into.
  public showAnticipation(): void {
    this.symbolView?.showFeatureTriggerAnimation();
  }

  public hideAnticipation(): void {
    this.symbolView?.cleanUpSymbolWin();
  }

  public destroy(options?: any): void {
    Ticker.shared.remove(this.onSpinTick, this);
    AnimationProxy.killTweensOf(this.symbolView);
    AnimationProxy.killTweensOf(this.topSymbolView);
    if (this.symbolView) {
      JCReelSymbolPool.getInstance().release(this.symbolView);
      this.symbolView = null;
    }
    if (this.topSymbolView) {
      JCReelSymbolPool.getInstance().release(this.topSymbolView);
      this.topSymbolView = null;
    }
    this.mask = null;
    super.destroy(options);
  }
}
