import { Container } from 'pixi.js';
import GridReelSymbol from './GridReelSymbol';
import { appModel } from '@core/models/services/AppModelService';

export interface GridReelSymbolCtor {
  new (configData: any): GridReelSymbol;
}

export interface GridReelSpinOptions {
  pool: any[];
  getSymbolClass: (name: string) => GridReelSymbolCtor;
  randomizeEntry?: (entry: any) => any;
}

const NORMAL_TICK_MS = 90;
const TURBO_TICK_MS = 40;
const ANTICIPATION_TICK_MS = 220;

export default class GridReel extends Container {
  private readonly column: number;
  private readonly row: number;
  private symbol: GridReelSymbol;
  private sticky: boolean = false;
  private anticipation: boolean = false;
  private spinning: boolean = false;
  private spinOptions: GridReelSpinOptions | null = null;
  private spinTickHandle: number | null = null;

  constructor(column: number, row: number) {
    super();
    this.column = column;
    this.row = row;
  }

  public getColumn(): number {
    return this.column;
  }

  public getRow(): number {
    return this.row;
  }

  public setSticky(flag: boolean): void {
    this.sticky = flag;
    this.symbol?.setSticky(flag);
  }

  public isSticky(): boolean {
    return this.sticky;
  }

  public setAnticipation(flag: boolean): void {
    this.anticipation = flag;
    if (this.spinning) {
      this.restartSpinTicker();
    }
  }

  public isAnticipation(): boolean {
    return this.anticipation;
  }

  public getSymbol(): GridReelSymbol {
    return this.symbol;
  }

  public isSpinning(): boolean {
    return this.spinning;
  }

  // -------------------------
  // Spin lifecycle
  // -------------------------

  public startSpin(options: GridReelSpinOptions): void {
    if (this.sticky) return;
    this.spinOptions = options;
    this.spinning = true;
    this.restartSpinTicker();
  }

  public stopSpin(data: any, SymbolClass: GridReelSymbolCtor, onComplete?: () => void): void {
    this.clearSpinTicker();
    this.spinning = false;
    this.spinOptions = null;
    if (this.sticky) {
      onComplete?.();
      return;
    }
    this.setSymbolData(data, SymbolClass);
    this.symbol.playLandSequence(onComplete);
  }

  // Populates this reel before any spin has ever happened (e.g. first game load), so the
  // grid doesn't render blank. No land animation - just an idle symbol sitting in place.
  public showInitial(data: any, SymbolClass: GridReelSymbolCtor): void {
    this.setSymbolData(data, SymbolClass);
    this.symbol.showIdle();
  }

  // -------------------------
  // Random spin-cycle ticker
  // -------------------------

  private restartSpinTicker(): void {
    this.clearSpinTicker();
    const interval = this.getSpinTickInterval();
    this.spinTickHandle = window.setInterval(() => this.showRandomFrame(), interval);
  }

  private clearSpinTicker(): void {
    if (this.spinTickHandle != null) {
      window.clearInterval(this.spinTickHandle);
      this.spinTickHandle = null;
    }
  }

  private getSpinTickInterval(): number {
    if (this.anticipation) return ANTICIPATION_TICK_MS;
    if (appModel.turboMode) return TURBO_TICK_MS;
    return NORMAL_TICK_MS;
  }

  private showRandomFrame(): void {
    if (!this.spinOptions) return;
    const { pool, getSymbolClass, randomizeEntry } = this.spinOptions;
    let data = pool[Math.floor(Math.random() * pool.length)];
    if (randomizeEntry) {
      data = randomizeEntry(data);
    }
    this.setSymbolData(data, getSymbolClass(data?.name));
  }

  // -------------------------
  // Helpers
  // -------------------------

  private setSymbolData(data: any, SymbolClass: GridReelSymbolCtor): void {
    if (!(this.symbol instanceof SymbolClass)) {
      this.setSymbol(new SymbolClass({ data }));
    } else {
      this.symbol.setNewSymbol(data, this.column);
    }
  }

  private setSymbol(newSymbol: GridReelSymbol): void {
    if (this.symbol) {
      this.removeChild(this.symbol);
      this.symbol.destroy();
    }
    this.symbol = newSymbol;
    this.addChild(this.symbol);
  }
}
