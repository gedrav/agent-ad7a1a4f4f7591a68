import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { BLANK_BONUS_SYMBOL_NAME, getRandomBonusSymbolName } from '../../config/BonusSymbolsConfig';
import BonusReel from './BonusReel';

// Config nested under this Comp's `data`, same convention as HoldNWinReelsContainer's.
export interface BonusReelsContainerData {
  columns: number;
  symbolWidth: number;
  symbolHeight: number;
  symbolScale: number;
  reelGap?: number;
  spinStartGap?: number;
  stopGap?: number;
  spinSpeedMultiplier?: number;
  // One entry per column; missing cells fall back to the blank/lightning tile.
  initialReel?: string[];
}

// The bonus round's top-panel reels: one row of independent BonusReels laid out left to right,
// centred on this Comp's origin so it can sit straight on top of top_panel_bg (see
// BonusReelsConfig.ts). Each reel masks its own cell rather than the row sharing one mask, since
// every reel starts and stops on its own stagger.
//
// Unlike HoldNWinReelsContainer this listens for nothing and drives nothing on its own: visibility
// rides the bonus layout's alpha (see BonusTriggerLayoutConfig), and spin()/stopSpin() are called
// by whoever knows the round's result.
export class BonusReelsContainer extends ResponsiveChildrenView {
  private readonly columns: number;
  private readonly symbolWidth: number;
  private readonly reelGap: number;
  private readonly spinStartGap: number;
  private readonly stopGap: number;
  private readonly reels: BonusReel[] = [];
  private readonly spinTimeoutIds: any[] = [];
  private readonly stopTimeoutIds: any[] = [];

  constructor(configData: any) {
    super(configData);
    const data: BonusReelsContainerData = this.configData.data ?? {};
    this.columns = data.columns;
    this.symbolWidth = data.symbolWidth;
    this.reelGap = data.reelGap ?? 0;
    this.spinStartGap = data.spinStartGap ?? 0;
    this.stopGap = data.stopGap ?? 0;
    this.createReels(data);
  }

  private createReels(data: BonusReelsContainerData): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;

    for (let column = 0; column < this.columns; column++) {
      const reel = new BonusReel({
        column,
        symbolWidth: this.symbolWidth,
        symbolHeight: data.symbolHeight,
        symbolScale: data.symbolScale,
        spinSpeedMultiplier: data.spinSpeedMultiplier,
        initialSymbol: data.initialReel?.[column] ?? BLANK_BONUS_SYMBOL_NAME,
      });
      reel.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
      this.reels[column] = reel;
      this.addChild(reel);
    }
  }

  public getReel(column: number): BonusReel {
    return this.reels[column];
  }

  public forEachReel(callback: (reel: BonusReel, column: number) => void): void {
    this.reels.forEach((reel, column) => callback(reel, column));
  }

  public getSymbolName(column: number): string | null {
    return this.reels[column]?.getSymbolName() ?? null;
  }

  // Places a whole row directly, skipping the spin entirely.
  public showSymbols(names: string[]): void {
    this.forEachReel((reel, column) => reel.showSymbol(names[column] ?? BLANK_BONUS_SYMBOL_NAME));
  }

  // Staggered by spinStartGap so the reels don't all start in the same frame.
  public spin(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    this.forEachReel((reel, column) => {
      this.spinTimeoutIds.push(setTimeout(() => reel.spin(), column * this.spinStartGap));
    });
  }

  // onComplete fires once every reel has actually settled (see BonusReel.stopSpin()'s onSettled),
  // not merely once told to stop.
  public stopSpin(finalSymbols: string[], onComplete?: () => void): void {
    this.clearTimeouts(this.stopTimeoutIds);
    let settledCount = 0;
    this.forEachReel((reel, column) => {
      this.stopTimeoutIds.push(
        setTimeout(() => {
          reel.stopSpin(finalSymbols[column] ?? BLANK_BONUS_SYMBOL_NAME, () => {
            settledCount++;
            if (settledCount === this.reels.length) {
              onComplete?.();
            }
          });
        }, column * this.stopGap),
      );
    });
  }

  // Stand-in for a real result while the backend field carrying these symbols is still undefined -
  // lands every reel on its own random symbol. Returns what it landed on so a caller can report it.
  public stopSpinRandom(onComplete?: (finalSymbols: string[]) => void): string[] {
    const finalSymbols = this.reels.map(() => getRandomBonusSymbolName());
    this.stopSpin(finalSymbols, () => onComplete?.(finalSymbols));
    return finalSymbols;
  }

  private clearTimeouts(ids: any[]): void {
    ids.forEach((id) => clearTimeout(id));
    ids.length = 0;
  }

  public destroyView(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    this.clearTimeouts(this.stopTimeoutIds);
    super.destroyView();
  }
}
