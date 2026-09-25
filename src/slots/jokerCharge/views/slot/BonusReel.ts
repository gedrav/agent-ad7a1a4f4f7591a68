import { Container, Ticker } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { UIUtil } from '@core/utils/UIUtilService';
import { getRandomBonusSymbolName } from '../../config/BonusSymbolsConfig';
import BonusReelSymbol from './BonusReelSymbol';

export interface BonusReelConfig {
  column: number;
  symbolWidth: number;
  symbolHeight: number;
  symbolScale: number;
  initialSymbol: string;
  // Scales every speed except windUpDistance, so stopMinSpeed stays <= spinMaxSpeed. Defaults to 1.
  spinSpeedMultiplier?: number;
}

type SpinPhase = 'idle' | 'windup' | 'spin' | 'stopping';

// One top-panel reel, same two-symbol fake-endless-strip as HoldNWinReel. These never go sticky
// and have no landing animation - "spinning" is just the blurred skin (see BonusSymbolsConfig).
//
// Invariant: while idle, symbolView sits at y 0 and topSymbolView is hidden at -symbolHeight.
export default class BonusReel extends Container {
  public readonly column: number;
  private readonly symbolHeight: number;
  private readonly spinContainer: Container;
  private readonly maskShape: PixGraphics;
  private symbolView: BonusReelSymbol;
  private topSymbolView: BonusReelSymbol;

  private readonly windUpSpeed: number;
  private readonly windUpDistance: number;
  private readonly spinAccel: number;
  private readonly spinMaxSpeed: number;
  private readonly stopMinSpeed: number;

  private phase: SpinPhase = 'idle';
  private spinSpeed = 0;
  private pendingFinalSymbolName: string | null = null;
  private settlingSymbol: BonusReelSymbol | null = null;
  private onSettled: (() => void) | null = null;

  constructor(config: BonusReelConfig) {
    super();
    this.column = config.column;
    this.symbolHeight = config.symbolHeight;

    const speed = config.spinSpeedMultiplier ?? 1;
    this.windUpSpeed = this.symbolHeight * 0.035 * speed;
    this.windUpDistance = this.symbolHeight * 0.21;
    this.spinAccel = this.symbolHeight * 0.007 * speed;
    this.spinMaxSpeed = this.symbolHeight * 0.42 * speed;
    this.stopMinSpeed = this.symbolHeight * 0.35 * speed;

    this.spinContainer = new Container();
    this.spinContainer.label = 'bonusSpinContainer';
    this.addChild(this.spinContainer);

    // Only applied while spinning - the blurred skins are taller and would bleed past the cell.
    this.maskShape = UIUtil.getRectangle(
      config.symbolWidth,
      config.symbolHeight,
      0xff0000,
      -config.symbolWidth / 2,
      -config.symbolHeight / 2,
    );
    this.maskShape.label = 'bonusSpinMask';
    this.maskShape.alpha = 0;
    this.spinContainer.addChild(this.maskShape);

    this.symbolView = new BonusReelSymbol(config.initialSymbol, config.symbolScale);
    this.spinContainer.addChild(this.symbolView);

    // Offset by symbolHeight, not measured bounds - a blurred skin measures taller and would jitter.
    this.topSymbolView = new BonusReelSymbol(getRandomBonusSymbolName(), config.symbolScale);
    this.topSymbolView.y = -this.symbolHeight;
    this.topSymbolView.visible = false;
    this.spinContainer.addChild(this.topSymbolView);
  }

  public getSymbolName(): string {
    return this.symbolView.getSymbolName();
  }

  public showSymbol(name: string): void {
    this.symbolView.setSymbol(name);
    this.symbolView.setBlurred(false);
    this.symbolView.y = 0;
    this.symbolView.visible = true;
    this.topSymbolView.visible = false;
    this.topSymbolView.y = -this.symbolHeight;
    this.spinContainer.mask = null;
  }

  public spin(): void {
    if (this.phase !== 'idle') return;
    this.spinContainer.mask = this.maskShape;
    this.pendingFinalSymbolName = null;
    this.settlingSymbol = null;
    this.spinSpeed = 0;
    this.phase = 'windup';
    this.symbolView.setBlurred(true);
    this.topSymbolView.setSymbol(getRandomBonusSymbolName());
    this.topSymbolView.setBlurred(true);
    this.topSymbolView.visible = true;
    Ticker.shared.add(this.onSpinTick, this);
  }

  // onSettled fires once the symbol reaches rest, not when stopSpin() is called.
  public stopSpin(finalSymbolName: string, onSettled?: () => void): void {
    if (this.phase === 'idle') {
      this.showSymbol(finalSymbolName);
      onSettled?.();
      return;
    }
    this.pendingFinalSymbolName = finalSymbolName;
    this.onSettled = onSettled ?? null;
    this.phase = 'stopping';
  }

  private onSpinTick(ticker: Ticker): void {
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

  // See HoldNWinReel.recycleIfNeeded(): wrapping by the strip's length keeps the two symbols a
  // fixed distance apart.
  private recycleIfNeeded(symbol: BonusReelSymbol): void {
    if (symbol === this.settlingSymbol) return;
    if (symbol.y < this.symbolHeight) return;
    symbol.y -= this.symbolHeight * 2;
    symbol.setSymbol(getRandomBonusSymbolName());
    symbol.setBlurred(true);
  }

  // Exactly one of the two symbols has y <= 0 at a time; that one takes the final result.
  private checkSettle(): void {
    if (this.pendingFinalSymbolName && !this.settlingSymbol) {
      const front = this.symbolView.y <= 0 ? this.symbolView : this.topSymbolView;
      front.setSymbol(this.pendingFinalSymbolName);
      front.setBlurred(true);
      this.settlingSymbol = front;
      this.pendingFinalSymbolName = null;
    }
    if (this.settlingSymbol && this.settlingSymbol.y >= 0) {
      this.finishSettle(this.settlingSymbol);
    }
  }

  private finishSettle(front: BonusReelSymbol): void {
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
    front.setBlurred(false);

    const onSettled = this.onSettled;
    this.onSettled = null;
    onSettled?.();
  }

  public destroy(options?: any): void {
    Ticker.shared.remove(this.onSpinTick, this);
    this.spinContainer.mask = null;
    this.spinContainer.removeChild(this.symbolView, this.topSymbolView);
    this.symbolView.destroy();
    this.topSymbolView.destroy();
    super.destroy(options);
  }
}
