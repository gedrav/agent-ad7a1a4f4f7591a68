import { Container, Ticker } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { SYMBOLS_DATA, getRandomSymbolName } from '../../config/SymbolsConfig';
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

export interface HoldNWinReelConfig {
  row: number;
  column: number;
  symbolWidth: number;
  symbolHeight: number;
  // Scales every speed except windUpDistance, so stopMinSpeed stays <= spinMaxSpeed. Defaults to 1.
  spinSpeedMultiplier?: number;
}

type SpinPhase = 'idle' | 'windup' | 'spin' | 'stopping';

// A single Hold & Win cell: two symbols symbolHeight apart, swapped to fake an endless strip.
// Once sticky, ignores spin()/stopSpin() until setSticky(false).
export default class HoldNWinReel extends Container {
  public readonly row: number;
  public readonly column: number;
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly spinContainer: Container;
  private readonly maskShape: PixGraphics;
  private readonly smallSquareAnim: PixSpine;
  private readonly chainLockAnim: PixSpine;
  private sticky = false;
  private symbolView: JCReelSymbol | null = null;
  private topSymbolView: JCReelSymbol | null = null;

  private readonly windUpSpeed: number;
  private readonly windUpDistance: number;
  private readonly spinAccel: number;
  private readonly spinMaxSpeed: number;
  private readonly stopMinSpeed: number;

  private phase: SpinPhase = 'idle';
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

    this.spinContainer = new Container();
    this.addChild(this.spinContainer);

    // Only applied while spinning - a spine's bbox can bleed past the cell mid-animation.
    this.maskShape = UIUtil.getRectangle(
      this.symbolWidth,
      this.symbolHeight,
      0xff0000,
      -this.symbolWidth / 2,
      -this.symbolHeight / 2,
    );
    this.maskShape.alpha = 0;
    this.spinContainer.addChild(this.maskShape);

    // Offset by symbolHeight, not measured bounds - a mid-animation spine's bounds jitter.
    const topSymbolName = getRandomSymbolName();
    this.topSymbolView = JCReelSymbolPool.getInstance().acquire(topSymbolName, this.column, this.row);
    this.applySymbolScale(this.topSymbolView, SYMBOLS_DATA[topSymbolName]?.cellScale);
    this.topSymbolView.y = -this.symbolHeight;
    this.topSymbolView.visible = false;
    this.spinContainer.addChild(this.topSymbolView);

    // Outside spinContainer so the spin mask never clips it.
    this.smallSquareAnim = UIUtil.getSpineAnim(SMALL_SQUARE_SPINE_NAME, { spineName: SMALL_SQUARE_SPINE_NAME });
    this.smallSquareAnim.visible = false;
    this.smallSquareAnim.scale.set(0.65);
    this.smallSquareAnim.y = -23;
    this.addChild(this.smallSquareAnim);

    // Outside spinContainer so the spin mask never clips it.
    this.chainLockAnim = UIUtil.getSpineAnim(CHAIN_LOCK_SPINE_NAME, { spineName: CHAIN_LOCK_SPINE_NAME });
    this.chainLockAnim.visible = false;
    this.chainLockAnim.scale.set(1.2);
    this.addChild(this.chainLockAnim);
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

  // Both are refreshed - topSymbolView can be visible mid-spin.
  public refreshBlanksVisual(): void {
    this.symbolView?.refreshBlanksVisual();
    this.topSymbolView?.refreshBlanksVisual();
  }

  public showSymbol(name: string): void {
    const pool = JCReelSymbolPool.getInstance();
    if (this.symbolView) {
      pool.release(this.symbolView);
    }
    this.symbolView = pool.acquire(name, this.column, this.row);
    this.applySymbolScale(this.symbolView, SYMBOLS_DATA[name]?.cellScale);
    this.symbolView.y = 0;
    this.spinContainer.addChild(this.symbolView);
    this.symbolView.showIdle();
    this.spinContainer.mask = null;
  }

  // Reset to 1 first: pooled instances can carry a stale scale. Only Blanks lacks a cellScale and
  // falls back to auto-fit.
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

  public spin(): void {
    if (this.sticky || this.phase !== 'idle' || !this.symbolView || !this.topSymbolView) return;
    this.spinContainer.mask = this.maskShape;
    this.pendingFinalSymbolName = null;
    this.settlingSymbol = null;
    this.spinSpeed = 0;
    this.phase = 'windup';
    this.setSpinningVisual(this.symbolView);
    this.setSpinningVisual(this.topSymbolView);
    this.topSymbolView.visible = true;
    Ticker.shared.add(this.onSpinTick, this);
  }

  // onSettled fires once the symbol reaches rest, not when stopSpin() is called.
  public stopSpin(finalSymbolName: string, onSettled?: () => void): void {
    if (this.sticky) return;
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
  }

  // setNewSymbol() tears the spine down; setBlurredTexture() rebuilds it so the cell isn't blank.
  private setSymbolContentForSpin(symbol: JCReelSymbol, name: string): void {
    symbol.setNewSymbol({ ...SYMBOLS_DATA[name], row: this.row }, this.column);
    this.applySymbolScale(symbol, SYMBOLS_DATA[name]?.cellScale);
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

  private recycleIfNeeded(symbol: JCReelSymbol): void {
    if (symbol === this.settlingSymbol) return;
    if (symbol.y < this.symbolHeight) return;
    symbol.y = -this.symbolHeight;
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

    const back = front === this.symbolView ? this.topSymbolView : this.symbolView;
    back.visible = false;
    back.y = -this.symbolHeight;
    this.symbolView = front;
    this.topSymbolView = back;
    this.spinContainer.mask = null;

    front.y = 0;
    front.showLanding(() => front.showIdle());

    const onSettled = this.onSettled;
    this.onSettled = null;
    onSettled?.();
  }

  public showAnticipation(): void {
    this.symbolView?.showFeatureTriggerAnimation();
  }

  public hideAnticipation(): void {
    this.symbolView?.cleanUpSymbolWin();
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
