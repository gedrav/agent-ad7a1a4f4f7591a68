import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { getRandomSymbolName } from '../../config/SymbolsConfig';
import HoldNWinReel from './HoldNWinReel';

// Neutral placeholder shown in any cell without an initialReel entry.
const PLACEHOLDER_SYMBOL = 'Blanks';

export interface HoldNWinPosition {
  column: number;
  row: number;
}

// Config nested under this Comp's `data`, matching other games' reel config convention (e.g.
// carpathiantreasures's `slotReel`).
export interface HoldNWinReelsContainerData {
  rows: number;
  columns: number;
  symbolWidth: number;
  symbolHeight: number;
  reelGap?: number;
  rowGap?: number;
  spinStartGap?: number;
  stopGap?: number;
  // Column-major (initialReel[column][row]), same convention as stopSpin(finalGrid). Missing
  // cells fall back to PLACEHOLDER_SYMBOL.
  initialReel?: string[][];
  // Floor on how long a spin visibly runs before it's allowed to stop (see tryStopSpin()). Milliseconds.
  minSpinDuration?: number;
  minSpinDurationTurbo?: number;
  // Passed through to every HoldNWinReel. >1 speeds up, <1 slows down. Defaults to 1.
  spinSpeedMultiplier?: number;
}

// TODO: replace with the real BE round-trip once the Hold & Win spin-response is finalized (see
// HoldNWinReelsConfig.ts) - not a stand-in for real server timing.
const DUMMY_RESPONSE_DELAY = 500;

// One independent HoldNWinReel per position - each locks/spins on its own rather than whole
// columns scrolling together like the main game reel.
//
// Grid access is column-major (reels[column][row]) to match the backend's grid payload and
// corelib's SlotReel convention; passing (row, column) anywhere here will silently transpose the grid.
export class HoldNWinReelsContainer extends ResponsiveChildrenView {
  private readonly rows: number;
  private readonly columns: number;
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly reelGap: number;
  private readonly rowGap: number;
  private readonly spinStartGap: number;
  private readonly stopGap: number;
  private readonly minSpinDuration: number;
  private readonly minSpinDurationTurbo: number;
  private readonly spinSpeedMultiplier: number;
  private readonly reels: HoldNWinReel[][] = [];
  private readonly initialReel: string[][] | undefined;
  private readonly spinTimeoutIds: any[] = [];
  private readonly stopTimeoutIds: any[] = [];
  private minDurationTimeoutId: any = null;
  private responseTimeoutId: any = null;
  // Reset at the start of every spin; tryStopSpin() only stops once both are ready.
  private minDurationElapsed = false;
  private pendingFinalGrid: string[][] | null = null;

  constructor(configData: any) {
    super(configData);
    const data: HoldNWinReelsContainerData = this.configData.data ?? {};
    this.rows = data.rows;
    this.columns = data.columns;
    this.symbolWidth = data.symbolWidth;
    this.symbolHeight = data.symbolHeight;
    this.reelGap = data.reelGap ?? 0;
    this.rowGap = data.rowGap ?? 0;
    this.spinStartGap = data.spinStartGap ?? 80;
    this.stopGap = data.stopGap ?? 150;
    this.minSpinDuration = data.minSpinDuration ?? 2000;
    this.minSpinDurationTurbo = data.minSpinDurationTurbo ?? 750;
    this.spinSpeedMultiplier = data.spinSpeedMultiplier ?? 1;
    this.initialReel = data.initialReel;
    this.createReels();
    // Dev-stage wiring so the existing spin button drives this grid too; move to a dedicated
    // Hold & Win flow once one exists.
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.simulateSpinResponse.bind(this));
  }

  private createReels(): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;
    const totalHeight = this.rows * this.symbolHeight + (this.rows - 1) * this.rowGap;

    for (let column = 0; column < this.columns; column++) {
      this.reels[column] = [];
      for (let row = 0; row < this.rows; row++) {
        const reel = new HoldNWinReel({
          row,
          column,
          symbolWidth: this.symbolWidth,
          symbolHeight: this.symbolHeight,
          spinSpeedMultiplier: this.spinSpeedMultiplier,
        });
        reel.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
        reel.y = row * (this.symbolHeight + this.rowGap) - totalHeight / 2 + this.symbolHeight / 2;
        reel.showSymbol(this.initialReel?.[column]?.[row] ?? PLACEHOLDER_SYMBOL);
        this.reels[column][row] = reel;
        this.addChild(reel);
      }
    }
  }

  // TODO: replace the response side with a real BE round-trip once finalized (see
  // DUMMY_RESPONSE_DELAY) - the min-duration side in tryStopSpin() is permanent, real behavior.
  // doNextStep() here stands in for corelib's SlotReel.onReelStripStopped(), since JokerCharge has
  // no main-game reel wired up yet; move this call there once one exists.
  private simulateSpinResponse(): void {
    this.spin();
    this.minDurationElapsed = false;
    this.pendingFinalGrid = null;

    const minDuration = appModel.turboMode ? this.minSpinDurationTurbo : this.minSpinDuration;
    clearTimeout(this.minDurationTimeoutId);
    this.minDurationTimeoutId = setTimeout(() => {
      this.minDurationElapsed = true;
      this.tryStopSpin();
    }, minDuration);

    clearTimeout(this.responseTimeoutId);
    this.responseTimeoutId = setTimeout(() => {
      this.pendingFinalGrid = this.createDummyFinalGrid();
      this.tryStopSpin();
    }, DUMMY_RESPONSE_DELAY);
  }

  // Stops only once both the min duration has elapsed and a response has arrived - whichever
  // finishes last triggers it.
  private tryStopSpin(): void {
    if (!this.minDurationElapsed || !this.pendingFinalGrid) return;
    const grid = this.pendingFinalGrid;
    this.pendingFinalGrid = null;
    this.stopSpin(grid, () => StateManager.doNextStep());
  }

  // Fakes a spin result until the real BE response lands.
  private createDummyFinalGrid(): string[][] {
    const grid: string[][] = [];
    for (let column = 0; column < this.columns; column++) {
      grid[column] = [];
      for (let row = 0; row < this.rows; row++) {
        grid[column][row] = getRandomSymbolName();
      }
    }
    return grid;
  }

  public getReel(column: number, row: number): HoldNWinReel {
    return this.reels[column]?.[row];
  }

  public forEachReel(callback: (reel: HoldNWinReel, column: number, row: number) => void): void {
    for (let column = 0; column < this.columns; column++) {
      for (let row = 0; row < this.rows; row++) {
        callback(this.reels[column][row], column, row);
      }
    }
  }

  public setSticky(column: number, row: number, flag: boolean): void {
    this.getReel(column, row)?.setSticky(flag);
  }

  public isSticky(column: number, row: number): boolean {
    return this.getReel(column, row)?.isSticky() ?? false;
  }

  public getFilledCount(): number {
    let count = 0;
    this.forEachReel((reel) => {
      if (reel.isSticky()) count++;
    });
    return count;
  }

  public getEmptyCount(): number {
    return this.rows * this.columns - this.getFilledCount();
  }

  public isGridFull(): boolean {
    return this.getEmptyCount() === 0;
  }

  // Staggered by spinStartGap so reels don't all start in the same frame. Sticky reels are skipped.
  public spin(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    let delayIndex = 0;
    this.forEachReel((reel) => {
      if (reel.isSticky()) return;
      const index = delayIndex++;
      this.spinTimeoutIds.push(setTimeout(() => reel.spin(), index * this.spinStartGap));
    });
  }

  // onComplete fires once every reel has actually settled (see HoldNWinReel.stopSpin()'s
  // onSettled), not merely once told to stop - landing animations keep running after that.
  // Sticky reels don't count.
  public stopSpin(finalGrid: string[][], onComplete?: () => void): void {
    this.clearTimeouts(this.stopTimeoutIds);
    const pending: { reel: HoldNWinReel; symbolName: string }[] = [];
    this.forEachReel((reel, column, row) => {
      if (reel.isSticky()) return;
      pending.push({ reel, symbolName: finalGrid[column][row] });
    });

    if (pending.length === 0) {
      onComplete?.();
      return;
    }

    let settledCount = 0;
    pending.forEach(({ reel, symbolName }, index) => {
      this.stopTimeoutIds.push(
        setTimeout(() => {
          reel.stopSpin(symbolName, () => {
            settledCount++;
            if (settledCount === pending.length) {
              onComplete?.();
            }
          });
        }, index * this.stopGap),
      );
    });
  }

  public showAnticipation(positions: HoldNWinPosition[]): void {
    positions.forEach(({ column, row }) => this.getReel(column, row)?.showAnticipation());
  }

  public hideAnticipation(positions: HoldNWinPosition[]): void {
    positions.forEach(({ column, row }) => this.getReel(column, row)?.hideAnticipation());
  }

  private clearTimeouts(ids: any[]): void {
    ids.forEach((id) => clearTimeout(id));
    ids.length = 0;
  }

  public destroyView(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    this.clearTimeouts(this.stopTimeoutIds);
    clearTimeout(this.minDurationTimeoutId);
    clearTimeout(this.responseTimeoutId);
    super.destroyView();
  }
}
