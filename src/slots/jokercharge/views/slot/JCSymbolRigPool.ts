import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';

// Rigs for a symbol's own layer (JCReelSymbol.symbol), pooled by spine name rather than by symbol
// name: several symbols share a rig - C1 to C5 and SCR are all 'hat' - and a cell changes symbol
// every few frames while the strip is moving.
//
// The cells' own effects - anticipation, chain lock, multiplier burst - come from here too, borrowed
// only while they play (see HoldNWinReel.acquireEffect).
//
// Without this every change built one Spine and destroyed another. new PixSpine() parses a
// skeleton and runs renderer.prepare.upload() on it, and at full spin speed the grid changes a
// symbol roughly twice a frame.
export class JCSymbolRigPool {
  private static instance: JCSymbolRigPool;
  private readonly free: Map<string, PixSpine[]> = new Map();
  // Which bucket a rig came out of, so release() can put it back without being told.
  private readonly owners: Map<PixSpine, string> = new Map();

  public static getInstance(): JCSymbolRigPool {
    return (JCSymbolRigPool.instance ??= new JCSymbolRigPool());
  }

  public acquire(data: any): PixSpine {
    const spineName: string = data.spineName;
    const spine = this.free.get(spineName)?.pop() ?? UIUtil.getSpineAnim(spineName, data);
    this.owners.set(spine, spineName);
    spine.setAutoUpdate(true);
    spine.stopAnimation();
    spine.visible = true;
    spine.alpha = 1;
    spine.scale.set(data.animScale ?? 1);
    return spine;
  }

  public release(spine: PixSpine): void {
    const spineName = this.owners.get(spine);
    if (!spineName) return;
    this.owners.delete(spine);
    spine.stopAnimation();
    spine.removeEventListners();
    // Off Ticker.shared while it waits, so an idle rig costs nothing per frame.
    spine.setAutoUpdate(false);
    spine.parent?.removeChild(spine);
    const entries = this.free.get(spineName) ?? [];
    entries.push(spine);
    this.free.set(spineName, entries);
  }

  public getStats(): Record<string, { free: number; inUse: number }> {
    const stats: Record<string, { free: number; inUse: number }> = {};
    for (const [name, entries] of this.free.entries()) {
      stats[name] = { free: entries.length, inUse: 0 };
    }
    for (const name of this.owners.values()) {
      stats[name] = stats[name] ?? { free: 0, inUse: 0 };
      stats[name].inUse++;
    }
    return stats;
  }
}
