import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { getRandomSymbolName } from '../../config/SymbolsConfig';
import HoldNWinReel from './HoldNWinReel';

// Neutral placeholder shown in any cell without an initialReel entry (see createReels()).
const PLACEHOLDER_SYMBOL = 'Blanks';

export interface HoldNWinPosition {
  column: number;
  row: number;
}

// Config expected under this Comp's `data` (matching how other games nest reel config, e.g.
// carpathiantreasures's SlotMachineConfig `slotReel` entry):
//   { rows, columns, symbolWidth, symbolHeight, reelGap?, rowGap?, spinStartGap?, stopGap?, initialReel? }
export interface HoldNWinReelsContainerData {
  rows: number;
  columns: number;
  symbolWidth: number;
  symbolHeight: number;
  reelGap?: number;
  rowGap?: number;
  spinStartGap?: number;
  stopGap?: number;
  // Static starting grid, column-major (initialReel[column][row]) - same convention as
  // stopSpin(finalGrid). Falls back to PLACEHOLDER_SYMBOL per cell for anything missing.
  initialReel?: string[][];
}

// TODO: replace with the real BE round-trip once the Hold & Win spin-response is finalized (see
// the TODO in HoldNWinReelsConfig.ts). This is only here so spin()/stopSpin() can be exercised
// end to end without a backend - it's not a stand-in for actual server timing.
const DUMMY_RESPONSE_DELAY = 2000;

// Manages a Hold & Win grid: one independent HoldNWinReel per position (rows * columns total -
// every position can be locked independently, so each spins/stops on its own rather than whole
// columns scrolling together like the main game reel).
//
// Grid storage and every (column, row) parameter here are column-major - reels[column][row] -
// to match both the backend's grid payload (grid[column][row], confirmed against
// responsetemp/Response.ts: position [0,1] on "cor-2x" lines up with grid[0][1]) and corelib's
// own SlotReel convention (symbolsArray[reelIndex][rowIndex]). Passing (row, column) anywhere
// here will silently transpose the grid, so it's called out here rather than left to bite
// whoever wires this up.
export class HoldNWinReelsContainer extends ResponsiveChildrenView {
  private readonly rows: number;
  private readonly columns: number;
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly reelGap: number;
  private readonly rowGap: number;
  private readonly spinStartGap: number;
  private readonly stopGap: number;
  private readonly reels: HoldNWinReel[][] = [];
  private readonly initialReel: string[][] | undefined;
  private readonly spinTimeoutIds: any[] = [];
  private readonly stopTimeoutIds: any[] = [];
  private dummyResponseTimeoutId: any = null;

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
    this.initialReel = data.initialReel;
    this.createReels();

    // Same event corelib's own SlotReel listens for on the main reels (see SlotReel.ts) - this
    // is a dev-stage wire-up so clicking the existing spin button visibly drives this grid too;
    // once a real Hold & Win state/command exists it'll likely trigger spins on its own terms
    // instead (e.g. a dedicated respin flow), and this listener should move there.
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.simulateSpinResponse.bind(this));
  }

  // Builds the (rows * columns) grid and positions each reel around this container's local
  // origin (0,0) as the grid's center, using reelGap (horizontal, between columns) and rowGap
  // (vertical, between rows) to space them. Each cell starts on initialReel[column][row] if
  // given (see HoldNWinReelsConfig.ts to edit it), otherwise PLACEHOLDER_SYMBOL.
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
        });
        reel.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
        reel.y = row * (this.symbolHeight + this.rowGap) - totalHeight / 2 + this.symbolHeight / 2;
        reel.showSymbol(this.initialReel?.[column]?.[row] ?? PLACEHOLDER_SYMBOL);
        this.reels[column][row] = reel;
        this.addChild(reel);
      }
    }
  }

  // TODO (see the class-level TODO on DUMMY_RESPONSE_DELAY): stands in for a real spin-response
  // round-trip so spin()/stopSpin() can be exercised without a backend. Replace with an actual
  // request once the Hold & Win spin-response is finalized.
  private simulateSpinResponse(): void {
    this.spin();
    clearTimeout(this.dummyResponseTimeoutId);
    this.dummyResponseTimeoutId = setTimeout(() => {
      this.stopSpin(this.createDummyFinalGrid());
    }, DUMMY_RESPONSE_DELAY);
  }

  // Random columns x rows grid - only used to fake a spin result until the real BE response
  // lands (see simulateSpinResponse above).
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

  // Starts every non-sticky reel spinning, staggered by spinStartGap so they don't all kick off
  // in the same frame. Sticky reels are left alone - they keep showing their held symbol.
  public spin(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    let delayIndex = 0;
    this.forEachReel((reel) => {
      if (reel.isSticky()) return;
      const index = delayIndex++;
      this.spinTimeoutIds.push(setTimeout(() => reel.spin(), index * this.spinStartGap));
    });
  }

  // Stops every non-sticky reel, staggered by stopGap, revealing finalGrid[column][row] on each;
  // calls onComplete once the last one has landed. Sticky reels are skipped entirely.
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

    pending.forEach(({ reel, symbolName }, index) => {
      this.stopTimeoutIds.push(
        setTimeout(() => {
          reel.stopSpin(symbolName);
          if (index === pending.length - 1) {
            onComplete?.();
          }
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
    clearTimeout(this.dummyResponseTimeoutId);
    super.destroyView();
  }
}
