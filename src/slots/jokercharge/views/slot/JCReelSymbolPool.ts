import JCReelSymbol from './JCReelSymbol';
import { JCSymbolData, SYMBOLS_DATA } from '@game/config/SymbolsConfig';

interface PoolEntry {
  symbol: JCReelSymbol;
  inUse: boolean;
}

// Pools whole JCReelSymbol instances by backend symbol name, mirroring corelib's SpinePool.
// acquire(name) to get one, release() when done with it.
export class JCReelSymbolPool {
  private static instance: JCReelSymbolPool;
  private readonly pool: Map<string, PoolEntry[]> = new Map();
  // Created when the pool was exhausted - not in entries[], so release() can find and destroy
  // them instead of leaking.
  private readonly temporarySymbols: Set<JCReelSymbol> = new Set();

  static readonly MIN_SIZE = 3;
  // The grid holds 27 instances at once: 9 cells, each its symbol and the one above and below on the
  // strip. The strip renames instances in place without coming back here, so the instances the
  // pool counts under one name can be every one of those 27 - in the feature, that name is BL.
  static readonly MAX_SIZE = 27;

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

  public acquire(name: string, reelNumber: number = 0, row: number = 0): JCReelSymbol {
    const entries = this.pool.get(name) ?? [];

    const free = entries.find((e) => !e.inUse);
    if (free) {
      free.inUse = true;
      free.symbol.setNewSymbol({ ...this.getData(name), row }, reelNumber);
      free.symbol.visible = true;
      return free.symbol;
    }

    if (entries.length < JCReelSymbolPool.MAX_SIZE) {
      const entry: PoolEntry = { symbol: this.createSymbol(name, reelNumber, row), inUse: true };
      entries.push(entry);
      this.pool.set(name, entries);
      return entry.symbol;
    }

    // Another name's spare instance before a new one: setNewSymbol() renames it in place, and every
    // instance built stays reachable for good (corelib's PixView never drops its global listeners).
    const spare = this.findFreeEntry();
    if (spare) {
      spare.inUse = true;
      spare.symbol.setNewSymbol({ ...this.getData(name), row }, reelNumber);
      spare.symbol.visible = true;
      return spare.symbol;
    }

    console.warn(`JCReelSymbolPool: pool exhausted for symbol "${name}", creating temporary symbol.`);
    const tempSymbol = this.createSymbol(name, reelNumber, row);
    this.temporarySymbols.add(tempSymbol);
    return tempSymbol;
  }

  public release(symbol: JCReelSymbol): void {
    // Always detach first: a symbol left parented stays in the reel it came from, and anything
    // that made it visible again would draw it over whatever landed there since.
    symbol.parent?.removeChild(symbol);

    if (this.temporarySymbols.has(symbol)) {
      this.temporarySymbols.delete(symbol);
      // destroyView(), not destroy(): the APP_RESIZE binding ReelSymbolSpineExtended makes in its
      // constructor is only disposed there, and JCReelSymbol hands back its spines and rigs there.
      symbol.destroyView();
      return;
    }

    const entry = this.findEntry(symbol);
    if (!entry) return;

    symbol.park();
    symbol.visible = false;
    entry.inUse = false;
  }

  // Found by instance, not by name: setNewSymbol() renames an instance in place while it stays in
  // the bucket it was created in, so a name lookup alone would miss it and leak the entry. acquire()
  // re-applies the bucket's data, so the bucket stays the truth about what an instance is for.
  private findEntry(symbol: JCReelSymbol): PoolEntry | undefined {
    const named = this.pool.get(symbol.getSymbolName())?.find((e) => e.symbol === symbol);
    if (named) return named;
    for (const entries of this.pool.values()) {
      const found = entries.find((e) => e.symbol === symbol);
      if (found) return found;
    }
    return undefined;
  }

  private findFreeEntry(): PoolEntry | undefined {
    for (const entries of this.pool.values()) {
      const free = entries.find((e) => !e.inUse);
      if (free) return free;
    }
    return undefined;
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

  private createSymbol(name: string, reelNumber: number = 0, row: number = 0): JCReelSymbol {
    return new JCReelSymbol({ data: { ...this.getData(name), reelNumber, row } });
  }
}
