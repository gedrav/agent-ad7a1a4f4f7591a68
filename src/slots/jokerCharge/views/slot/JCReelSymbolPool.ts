import JCReelSymbol from './JCReelSymbol';
import { JCSymbolData, SYMBOLS_DATA } from '@game/config/SymbolsConfig';

interface PoolEntry {
  symbol: JCReelSymbol;
  inUse: boolean;
}

// Pools whole JCReelSymbol instances by backend symbol name, mirroring corelib's SpinePool
// (which pools the spine sub-object one level below this). Fetch with acquire(name), give it
// back with release() once the symbol is off-screen / no longer needed.
export class JCReelSymbolPool {
  private static instance: JCReelSymbolPool;
  private readonly pool: Map<string, PoolEntry[]> = new Map();
  // Symbols created when the pool was exhausted - not in entries[], so release() can find and
  // destroy them instead of silently leaking them.
  private readonly temporarySymbols: Set<JCReelSymbol> = new Set();

  static readonly MIN_SIZE = 3;
  static readonly MAX_SIZE = 15;

  private constructor() {}

  public static getInstance(): JCReelSymbolPool {
    if (!JCReelSymbolPool.instance) {
      JCReelSymbolPool.instance = new JCReelSymbolPool();
    }
    return JCReelSymbolPool.instance;
  }

  public prewarm(names: string[] = Object.keys(SYMBOLS_DATA)): void {
    for (const name of names) {
      if (!this.pool.has(name)) {
        this.pool.set(name, []);
      }

      const entries = this.pool.get(name);
      const toCreate = JCReelSymbolPool.MIN_SIZE - entries.length;

      for (let i = 0; i < toCreate; i++) {
        const symbol = this.createSymbol(name);
        symbol.visible = false;
        entries.push({ symbol, inUse: false });
      }
    }
  }

  public acquire(name: string, reelNumber: number = 0): JCReelSymbol {
    const entries = this.pool.get(name) ?? [];

    const free = entries.find((e) => !e.inUse);
    if (free) {
      free.inUse = true;
      free.symbol.setNewSymbol(this.getData(name), reelNumber);
      free.symbol.visible = true;
      return free.symbol;
    }

    if (entries.length < JCReelSymbolPool.MAX_SIZE) {
      const entry: PoolEntry = { symbol: this.createSymbol(name, reelNumber), inUse: true };
      entries.push(entry);
      this.pool.set(name, entries);
      return entry.symbol;
    }

    console.warn(`JCReelSymbolPool: pool exhausted for symbol "${name}", creating temporary symbol.`);
    const tempSymbol = this.createSymbol(name, reelNumber);
    this.temporarySymbols.add(tempSymbol);
    return tempSymbol;
  }

  public release(symbol: JCReelSymbol): void {
    if (this.temporarySymbols.has(symbol)) {
      this.temporarySymbols.delete(symbol);
      symbol.destroySymbol();
      symbol.destroy();
      return;
    }

    const name = symbol.getSymbolName();
    const entries = this.pool.get(name);
    if (!entries) return;

    const entry = entries.find((e) => e.symbol === symbol);
    if (!entry) return;

    symbol.resetSymbol();
    symbol.visible = false;
    entry.inUse = false;
  }

  public getStats(): Record<string, { total: number; inUse: number }> {
    const stats: Record<string, { total: number; inUse: number }> = {};
    for (const [name, entries] of this.pool.entries()) {
      stats[name] = {
        total: entries.length,
        inUse: entries.filter((e) => e.inUse).length,
      };
    }
    return stats;
  }

  private getData(name: string): JCSymbolData {
    const data = SYMBOLS_DATA[name];
    if (!data) {
      throw new Error(`JCReelSymbolPool: unknown symbol "${name}"`);
    }
    return data;
  }

  private createSymbol(name: string, reelNumber: number = 0): JCReelSymbol {
    return new JCReelSymbol({ data: { ...this.getData(name), reelNumber } });
  }
}
