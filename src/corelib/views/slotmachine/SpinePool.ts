// -------------------------
// SpinePool.ts
// -------------------------

import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SymbolConfig } from './ReelSymbol';
import { UIUtil } from '@core/utils/UIUtilService';

interface PoolEntry {
  spine: PixSpine;
  inUse: boolean;
}

export class SpinePool {
  private static instance: SpinePool;
  private pool: Map<string, PoolEntry[]> = new Map();

  static readonly MIN_SIZE = 5;
  static readonly MAX_SIZE = 30;

  private constructor() {}

  public static getInstance(): SpinePool {
    if (!SpinePool.instance) {
      SpinePool.instance = new SpinePool();
    }
    return SpinePool.instance;
  }

  public prewarm(symbols: SymbolConfig['data'][]): void {
    for (const data of symbols) {
      if (!this.pool.has(data.name)) {
        this.pool.set(data.name, []);
      }

      const entries = this.pool.get(data.name)!;
      const toCreate = SpinePool.MIN_SIZE - entries.length;

      for (let i = 0; i < toCreate; i++) {
        entries.push({ spine: this.createSpine(data), inUse: false });
      }
    }
  }

  public acquire(data: SymbolConfig['data']): PixSpine {
    const entries = this.pool.get(data.name) ?? [];

    const free = entries.find((e) => !e.inUse);
    if (free) {
      free.inUse = true;
      return free.spine;
    }

    if (entries.length < SpinePool.MAX_SIZE) {
      const entry: PoolEntry = { spine: this.createSpine(data), inUse: true };
      entries.push(entry);
      this.pool.set(data.name, entries);
      return entry.spine;
    }

    console.warn(`SpinePool: pool exhausted for symbol "${data.name}", creating temporary spine.`);
    return this.createSpine(data);
  }

  public release(data: SymbolConfig['data'], spine: PixSpine): void {
    const entries = this.pool.get(data.name);
    if (!entries) return;

    const entry = entries.find((e) => e.spine === spine);
    if (!entry) return;

    spine.stopAnimation();
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

  private createSpine(data: SymbolConfig['data']): PixSpine {
    return UIUtil.getSpineAnim(data.spineName, data);
  }
}
