import { Container } from 'pixi.js';
import GridReel, { GridReelSymbolCtor } from './GridReel';
import GridReelSymbol from './GridReelSymbol';

export default class GridReelView extends Container {
  private readonly columns: number;
  private readonly rows: number;
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  private readonly symbolPool: any[];
  private readonly symbolClassMap: Record<string, GridReelSymbolCtor>;
  private readonly defaultSymbolClass: GridReelSymbolCtor;
  private readonly randomizeEntry?: (entry: any) => any;
  private reels: GridReel[][] = [];

  constructor(configData: any) {
    super();
    const data = configData.data ?? {};
    this.columns = data.columns ?? 3;
    this.rows = data.rows ?? 3;
    this.cellWidth = data.cellWidth ?? 200;
    this.cellHeight = data.cellHeight ?? 200;
    this.symbolPool = data.symbolPool ?? [];
    this.symbolClassMap = data.symbolClassMap ?? {};
    this.defaultSymbolClass = data.defaultSymbolClass ?? GridReelSymbol;
    this.randomizeEntry = data.randomizeEntry;
    this.buildGrid();
  }

  private buildGrid(): void {
    for (let col = 0; col < this.columns; col++) {
      this.reels[col] = [];
      for (let row = 0; row < this.rows; row++) {
        const reel = new GridReel(col, row);
        reel.x = col * this.cellWidth;
        reel.y = row * this.cellHeight;
        this.reels[col][row] = reel;
        this.addChild(reel);
        this.showInitialSymbol(reel);
      }
    }
  }

  private showInitialSymbol(reel: GridReel): void {
    const data = this.symbolPool[Math.floor(Math.random() * this.symbolPool.length)];
    if (!data) return;
    reel.showInitial(data, this.getSymbolClass(data.name));
  }

  public getReel(column: number, row: number): GridReel {
    return this.reels[column]?.[row];
  }

  public getAllReels(): GridReel[] {
    return this.reels.flat();
  }

  // -------------------------
  // Spin lifecycle
  // -------------------------

  public startSpin(): void {
    this.getAllReels().forEach((reel) => {
      reel.startSpin({
        pool: this.symbolPool,
        getSymbolClass: (name) => this.getSymbolClass(name),
        randomizeEntry: this.randomizeEntry,
      });
    });
  }

  public stopSpin(resultGrid: any[][], onComplete?: () => void): void {
    const reels = this.getAllReels();
    let remaining = reels.length;
    const onReelDone = () => {
      remaining--;
      if (remaining <= 0) {
        onComplete?.();
      }
    };
    reels.forEach((reel) => {
      const data = resultGrid[reel.getColumn()]?.[reel.getRow()];
      reel.stopSpin(data, this.getSymbolClass(data?.name), onReelDone);
    });
  }

  // -------------------------
  // Hold-and-win controls
  // -------------------------

  public setSticky(column: number, row: number, flag: boolean): void {
    this.getReel(column, row)?.setSticky(flag);
  }

  public setAnticipation(column: number, row: number, flag: boolean): void {
    this.getReel(column, row)?.setAnticipation(flag);
  }

  private getSymbolClass(name: string): GridReelSymbolCtor {
    return this.symbolClassMap[name] ?? this.defaultSymbolClass;
  }
}
