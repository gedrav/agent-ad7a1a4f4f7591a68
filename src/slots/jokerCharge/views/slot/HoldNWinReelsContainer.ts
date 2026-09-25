import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { JCEvents } from '../../events/JCEvents';
import { isRespinActive, isRowActive } from '../../models/JCLinesState';
import HoldNWinReel from './HoldNWinReel';
import { MYSTERY_REEL_CONFIG, MysteryReelResult } from './JCMysterySymbolModifier';

const MYSTERY_SYMBOLS = ['mystery', 'mystery jackpot'];

const PLACEHOLDER_SYMBOL = 'Blanks';
const COLUMN_EFFECT_SPINE = 'electr_effect';
const COLUMN_EFFECT_STATE = 'animation';
const BORDER_EFFECT_SPINE = 'saber_down';
const BORDER_EFFECT_STATE = 'animation';
// Their art overflows the cell, so the reels holding them are lifted above their neighbours.
const OVERSIZED_SYMBOLS = ['mystery', 'mystery jackpot', 'boost'];
const REEL_DEPTH_NORMAL = 0;
const REEL_DEPTH_OVERSIZED = 1;
const EFFECT_DEPTH = 2;
export interface HoldNWinPosition {
  column: number;
  row: number;
}

export interface HoldFieldEntry {
  position: number[];
  symbol: string;
  value?: number;
}

// Base spins carry a full grid; respin rounds carry only the collected cells.
export interface SpinResultPayload {
  grid?: string[][];
  holdField?: HoldFieldEntry[];
}

export interface MetamorphicSymbol {
  position: number[];
  symbol: string;
  value?: number;
}

export interface MysteryReveal {
  position: number[];
  result: MysteryReelResult;
}

export interface ModifierMultiplier {
  position: number[];
  multiplier: number;
}

export interface HoldNWinReelsContainerData {
  rows: number;
  columns: number;
  symbolWidth: number;
  symbolHeight: number;
  maskHeight?: number;
  landingOvershoot?: number;
  reelGap?: number;
  rowGap?: number;
  // Per-row nudge on top of the even spacing, one entry per row.
  rowOffsetsY?: number[];
  spinStartGap?: number;
  stopGap?: number;
  // Column-major; missing cells fall back to PLACEHOLDER_SYMBOL.
  initialReel?: string[][];
  // Floor on how long a spin visibly runs before it's allowed to stop, in ms.
  minSpinDuration?: number;
  minSpinDurationTurbo?: number;
  spinSpeedMultiplier?: number;
  // Extra ms an anticipating reel keeps spinning past its normal stop slot.
  anticipationDelay?: number;
  anticipationSpeedFactor?: number;
  columnEffectScale?: number;
  columnEffectOffsetY?: number;
  borderEffectScale?: number;
  borderEffectOffsetY?: number;
}

// One independent reel per position, each locking and spinning on its own. Grid access is
// column-major throughout - passing (row, column) anywhere here silently transposes the grid.
export class HoldNWinReelsContainer extends ResponsiveChildrenView {
  private readonly rows: number;
  private readonly columns: number;
  private readonly symbolWidth: number;
  private readonly symbolHeight: number;
  private readonly maskHeight: number | undefined;
  private readonly landingOvershoot: number | undefined;
  private readonly reelGap: number;
  private readonly rowGap: number;
  private readonly rowOffsetsY: number[] | undefined;
  private readonly spinStartGap: number;
  private readonly stopGap: number;
  private readonly minSpinDuration: number;
  private readonly minSpinDurationTurbo: number;
  private readonly spinSpeedMultiplier: number;
  private readonly anticipationDelay: number;
  private readonly anticipationSpeedFactor: number;
  private readonly reels: HoldNWinReel[][] = [];
  private readonly columnEffects: PixSpine[] = [];
  private readonly borderEffects: PixSpine[] = [];
  private readonly initialReel: string[][] | undefined;
  private readonly spinTimeoutIds: any[] = [];
  private readonly stopTimeoutIds: any[] = [];
  private minDurationTimeoutId: any = null;
  private minDurationElapsed = false;
  // createReels() places a symbol per cell as it goes, so the grid is only walkable once it ends.
  private reelsBuilt = false;
  private pendingFinalGrid: string[][] | null = null;

  constructor(configData: any) {
    super(configData);
    const data: HoldNWinReelsContainerData = this.configData.data ?? {};
    this.rows = data.rows;
    this.columns = data.columns;
    this.symbolWidth = data.symbolWidth;
    this.symbolHeight = data.symbolHeight;
    this.maskHeight = data.maskHeight;
    this.landingOvershoot = data.landingOvershoot;
    this.reelGap = data.reelGap ?? 0;
    this.rowGap = data.rowGap ?? 0;
    this.rowOffsetsY = data.rowOffsetsY;
    this.spinStartGap = data.spinStartGap ?? 80;
    this.stopGap = data.stopGap ?? 150;
    this.minSpinDuration = data.minSpinDuration ?? 2000;
    this.minSpinDurationTurbo = data.minSpinDurationTurbo ?? 750;
    this.spinSpeedMultiplier = data.spinSpeedMultiplier ?? 1;
    this.anticipationDelay = data.anticipationDelay ?? 1200;
    this.anticipationSpeedFactor = data.anticipationSpeedFactor ?? 0.35;
    this.initialReel = data.initialReel;
    this.sortableChildren = true;
    this.createReels();
    this.createColumnEffects(data);
    this.createBorderEffects(data);
    // START_SPIN fires before the BE round-trip; the result arrives later on SPIN_RESULT_RECEIVED.
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.onSpinStart.bind(this));
    EventHandler.addEventListener(JCEvents.SPIN_RESULT_RECEIVED, this.onSpinResultReceived.bind(this));
    // Blanks already on the grid need re-checking on a line-count change, not just on placement.
    EventHandler.addEventListener(JCEvents.SELECTED_LINES, this.refreshBlanksVisuals.bind(this));
    EventHandler.addEventListener(SlotEvents.RENDER_UNFINISHED_REEL, this.renderUnfinishedGrid.bind(this));
  }

  private createColumnEffects(data: HoldNWinReelsContainerData): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;

    for (let column = 0; column < this.columns; column++) {
      const effect = UIUtil.getSpineAnim(COLUMN_EFFECT_SPINE, { spineName: COLUMN_EFFECT_SPINE });
      effect.scale.set(data.columnEffectScale ?? 0.65);
      effect.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
      effect.y = data.columnEffectOffsetY ?? 0;
      effect.visible = false;
      effect.label = 'Multi/SuperMultiEffect';
      effect.zIndex = EFFECT_DEPTH;
      this.columnEffects[column] = effect;
      this.addChild(effect);
    }
  }

  // One per column border, so there is one more of these than there are columns: index 0 is the
  // grid's left edge, index `columns` its right edge, and the ones between sit in the reel gap.
  private createBorderEffects(data: HoldNWinReelsContainerData): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;

    for (let border = 0; border <= this.columns; border++) {
      const effect = UIUtil.getSpineAnim(BORDER_EFFECT_SPINE, { spineName: BORDER_EFFECT_SPINE });
      effect.scale.set(data.borderEffectScale ?? 1.55);
      effect.x = this.getBorderX(border, totalWidth);
      effect.y = data.borderEffectOffsetY ?? 0;
      effect.visible = false;
      effect.label = 'Charged/SuperChargedEffect';
      effect.zIndex = EFFECT_DEPTH;
      this.borderEffects[border] = effect;
      this.addChild(effect);
    }
  }

  private getBorderX(border: number, totalWidth: number): number {
    if (border === 0) return -totalWidth / 2;
    if (border === this.columns) return totalWidth / 2;
    return -totalWidth / 2 + border * (this.symbolWidth + this.reelGap) - this.reelGap / 2;
  }

  // Sequencing between steps is the caller's business - see GameSlotMachineView.
  public playColumnEffects(columns: number[], onComplete?: () => void): void {
    this.playEffects(this.columnEffects, columns, COLUMN_EFFECT_STATE, onComplete);
  }

  // Same, for the column borders - indexes run 0..columns.
  public playBorderEffects(borders: number[], onComplete?: () => void): void {
    this.playEffects(this.borderEffects, borders, BORDER_EFFECT_STATE, onComplete);
  }

  private playEffects(pool: PixSpine[], indexes: number[], state: string, onComplete?: () => void): void {
    const targets = indexes.map((index) => pool[index]).filter(Boolean);
    if (!targets.length) {
      onComplete?.();
      return;
    }

    let finished = 0;
    targets.forEach((effect) => {
      const listener = effect.addEventListener('complete', () => {
        if (listener) effect.removeSpineEvent(listener);
        effect.visible = false;
        finished++;
        if (finished === targets.length) onComplete?.();
      });
      effect.visible = true;
      effect.playAnimation({ state, loop: false });
    });
  }

  public applyMultipliers(entries: ModifierMultiplier[], onComplete?: () => void): void {
    const targets = entries
      .map(({ position, multiplier }) => ({ reel: this.getReel(position[0], position[1]), multiplier }))
      .filter(({ reel }) => !!reel);

    if (!targets.length) {
      onComplete?.();
      return;
    }

    let finished = 0;
    targets.forEach(({ reel, multiplier }) => {
      reel.showMultiplier(multiplier, () => {
        finished++;
        if (finished === targets.length) onComplete?.();
      });
    });
  }

  // Already-earned badges from a resumed round: placed at rest, not replayed.
  private restoreMultipliers(entries: ModifierMultiplier[]): void {
    entries.forEach(({ position, multiplier }) => this.getReel(position[0], position[1])?.setMultiplier(multiplier));
  }

  public clearMultipliers(): void {
    this.forEachReel((reel) => reel.clearMultiplier());
  }

  public playActiveLineWins(onComplete?: () => void): void {
    const targets: HoldNWinReel[] = [];
    this.forEachReel((reel, _column, row) => {
      if (isRowActive(row)) targets.push(reel);
    });

    if (!targets.length) {
      onComplete?.();
      return;
    }

    let finished = 0;
    targets.forEach((reel) =>
      reel.playWinAnimation(() => {
        finished++;
        if (finished === targets.length) onComplete?.();
      }),
    );
  }

  // One cell at a time, so each trail reads on its own - turbo reveals them together.
  public playMetamorphicSymbols(entries: MetamorphicSymbol[], onComplete?: () => void): void {
    const targets = entries
      .map(({ position, symbol }) => ({ reel: this.getReel(position[0], position[1]), symbol }))
      .filter(({ reel }) => !!reel);

    if (!targets.length) {
      onComplete?.();
      return;
    }

    if (appModel.turboMode) {
      let finished = 0;
      targets.forEach(({ reel, symbol }) =>
        reel.revealMetamorphicSymbol(symbol, () => {
          finished++;
          if (finished === targets.length) onComplete?.();
        }),
      );
      return;
    }

    const revealNext = (index: number): void => {
      if (index >= targets.length) {
        onComplete?.();
        return;
      }
      targets[index].reel.revealMetamorphicSymbol(targets[index].symbol, () => revealNext(index + 1));
    };
    revealNext(0);
  }

  public startMysteryReels(): void {
    let index = 0;
    this.forEachReel((reel) => {
      if (!reel || !MYSTERY_SYMBOLS.includes(reel.getSymbolName()) || reel.isMysterySpinning()) return;
      reel.startMysteryReel(index++ * MYSTERY_REEL_CONFIG.staggerMs);
    });
  }

  public stopMysteryReels(): void {
    this.forEachReel((reel) => reel?.stopMysteryReel());
  }

  public revealMysterySymbols(entries: MysteryReveal[], onComplete?: () => void): void {
    const targets = entries
      .map(({ position, result }) => ({ reel: this.getReel(position[0], position[1]), result }))
      .filter(({ reel }) => !!reel);

    if (!targets.length) {
      onComplete?.();
      return;
    }

    let finished = 0;
    targets.forEach(({ reel, result }, index) => {
      reel.spinMysteryReel(result, index * MYSTERY_REEL_CONFIG.staggerMs).then(() => {
        finished++;
        if (finished === targets.length) onComplete?.();
      });
    });
  }

  public refreshBlanksVisuals(): void {
    this.forEachReel((reel) => reel.refreshBlanksVisual());
  }

  // Resume after a reconnect. corelib has no SlotReel here to answer RENDER_UNFINISHED_REEL, and
  // setUnfinishedInfo() has already pointed gameResult at the init response's unfinishedInfo - so
  // the grid arrives through the same field a live spin uses.
  private renderUnfinishedGrid(): void {
    const grid = this.toGrid({
      grid: appModel.getSpinResult()?.grid,
      holdField: appModel.featureResult?.holdField,
    });
    if (grid) this.showGrid(grid);
    this.restoreMultipliers(appModel.featureResult?.modifierMultipliers ?? []);
  }

  public showGrid(grid: string[][]): void {
    this.forEachReel((reel, column, row) => {
      const name = grid[column]?.[row];
      if (name) reel.showSymbol(name);
    });
    this.raiseOversizedReels();
  }

  // Reels are added column by column, so a cell's neighbours draw over whatever spills out of it.
  // Depth is held in zIndex rather than child order, so it survives anything that adds children
  // later: an oversized symbol sits above every other reel, and the effects above all of them.
  private raiseOversizedReels(): void {
    if (!this.reelsBuilt) return;
    this.forEachReel((reel) => {
      if (!reel) return;
      reel.zIndex = OVERSIZED_SYMBOLS.includes(reel.getSymbolName()) ? REEL_DEPTH_OVERSIZED : REEL_DEPTH_NORMAL;
    });
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
          maskHeight: this.maskHeight,
          landingOvershoot: this.landingOvershoot,
          onSymbolPlaced: () => this.raiseOversizedReels(),
          spinSpeedMultiplier: this.spinSpeedMultiplier,
          anticipationSpeedFactor: this.anticipationSpeedFactor,
        });
        reel.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
        reel.y =
          row * (this.symbolHeight + this.rowGap) -
          totalHeight / 2 +
          this.symbolHeight / 2 +
          (this.rowOffsetsY?.[row] ?? 0);
        reel.showSymbol(this.initialReel?.[column]?.[row] ?? PLACEHOLDER_SYMBOL);
        this.reels[column][row] = reel;
        this.addChild(reel);
      }
    }
    this.reelsBuilt = true;
    this.raiseOversizedReels();
  }

  private onSpinStart(): void {
    this.spin();
    this.minDurationElapsed = false;
    this.pendingFinalGrid = null;

    const minDuration = appModel.turboMode ? this.minSpinDurationTurbo : this.minSpinDuration;
    clearTimeout(this.minDurationTimeoutId);
    this.minDurationTimeoutId = setTimeout(() => {
      this.minDurationElapsed = true;
      this.tryStopSpin();
    }, minDuration);
  }

  private onSpinResultReceived(result: SpinResultPayload): void {
    this.pendingFinalGrid = this.toGrid(result);
    this.tryStopSpin();
  }

  // A respin round sends only the cells it has collected, so everything it doesn't mention is
  // blank. holdField positions are [column, row], matching this grid's own convention.
  private toGrid(result?: SpinResultPayload): string[][] | null {
    if (result?.grid) return result.grid;
    if (!result?.holdField) return null;

    const grid: string[][] = [];
    for (let column = 0; column < this.columns; column++) {
      grid[column] = new Array(this.rows).fill(PLACEHOLDER_SYMBOL);
    }
    result.holdField.forEach(({ position, symbol }) => {
      const [column, row] = position;
      if (grid[column]?.[row] !== undefined) grid[column][row] = symbol;
    });
    return grid;
  }

  // Stops once both the min duration has elapsed and a response has arrived, whichever is last.
  private tryStopSpin(): void {
    if (!this.minDurationElapsed || !this.pendingFinalGrid) return;
    const grid = this.pendingFinalGrid;
    this.pendingFinalGrid = null;
    this.stopSpin(grid, () => {
      if (isRespinActive()) this.holdFilledCells();
      StateManager.doNextStep();
    });
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

  // A cell already holding a symbol sits out the remaining respin rounds. Nothing to do with the
  // sticky/chain-lock mechanic - it only stops the cell taking part. Called when the feature starts
  // and again after every round settles.
  public holdFilledCells(): void {
    this.forEachReel((reel) => {
      if (reel.getSymbolName() !== PLACEHOLDER_SYMBOL) reel.setHeld(true);
    });
  }

  public releaseAllCells(): void {
    this.forEachReel((reel) => reel.setHeld(false));
  }

  public getFilledCount(): number {
    let count = 0;
    this.forEachReel((reel) => {
      if (reel.getSymbolName() !== PLACEHOLDER_SYMBOL) count++;
    });
    return count;
  }

  public getEmptyCount(): number {
    return this.rows * this.columns - this.getFilledCount();
  }

  public isGridFull(): boolean {
    return this.getEmptyCount() === 0;
  }

  public spin(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    let delayIndex = 0;
    this.forEachReel((reel) => {
      if (reel.isSticky() || reel.isHeld()) return;
      const index = delayIndex++;
      this.spinTimeoutIds.push(setTimeout(() => reel.spin(), index * this.spinStartGap));
    });
  }

  // onComplete fires once every non-sticky reel has settled, not when they were told to stop.
  public stopSpin(finalGrid: string[][], onComplete?: () => void): void {
    this.clearTimeouts(this.stopTimeoutIds);
    // Flagged up front so the animation runs while the reel is still spinning, not on arrival.
    // Each reel clears its own flag once it settles.
    this.resolveAnticipatedPositions(finalGrid).forEach(({ column, row }) =>
      this.getReel(column, row)?.setAnticipating(true),
    );

    const pending: { reel: HoldNWinReel; symbolName: string }[] = [];
    this.forEachReel((reel, column, row) => {
      if (reel.isSticky() || reel.isHeld()) return;
      pending.push({ reel, symbolName: finalGrid[column][row] });
    });

    if (pending.length === 0) {
      onComplete?.();
      return;
    }

    let settledCount = 0;
    pending.forEach(({ reel, symbolName }, index) => {
      const delay = index * this.stopGap + (reel.isAnticipating() ? this.anticipationDelay : 0);
      this.stopTimeoutIds.push(
        setTimeout(() => {
          reel.stopSpin(symbolName, () => {
            settledCount++;
            if (settledCount === pending.length) {
              onComplete?.();
            }
          });
        }, delay),
      );
    });
  }

  // A payline is a row, active per the selected line count (see JCLinesState). When every column
  // ahead of the last has landed a real symbol on an active row, that row's last cell is one
  // symbol away from completing the line, so it gets the anticipation treatment.
  //
  // Base game only: the respin feature pays by collecting symbols rather than by line, and
  // isRowActive() reports every row as active while it runs.
  private resolveAnticipatedPositions(finalGrid: string[][]): HoldNWinPosition[] {
    if (isRespinActive()) return [];

    const lastColumn = this.columns - 1;
    const positions: HoldNWinPosition[] = [];

    for (let row = 0; row < this.rows; row++) {
      if (!isRowActive(row)) continue;
      let lineLive = true;
      for (let column = 0; column < lastColumn; column++) {
        if (!this.hasLandedSymbol(finalGrid, column, row)) {
          lineLive = false;
          break;
        }
      }
      if (lineLive) positions.push({ column: lastColumn, row });
    }
    return positions;
  }

  private hasLandedSymbol(finalGrid: string[][], column: number, row: number): boolean {
    const name = finalGrid[column]?.[row];
    return !!name && name !== PLACEHOLDER_SYMBOL;
  }

  private clearTimeouts(ids: any[]): void {
    ids.forEach((id) => clearTimeout(id));
    ids.length = 0;
  }

  public destroyView(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    this.clearTimeouts(this.stopTimeoutIds);
    clearTimeout(this.minDurationTimeoutId);
    super.destroyView();
  }
}
