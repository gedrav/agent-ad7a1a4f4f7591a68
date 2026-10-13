import { Container, Graphics } from 'pixi.js';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import {
  BLANK_SYMBOL_NAME,
  BOOST_SOURCE_SYMBOL_NAMES,
  BOOST_SYMBOL_NAME,
  CHARGE_LADDER,
  SYMBOLS_DATA,
  MYSTERY_SYMBOL_NAMES,
  OVERSIZED_SYMBOL_NAMES,
  STICKY_SYMBOL_NAMES,
  TRAIL_SYMBOL_NAMES,
} from '../../config/SymbolsConfig';
import { JCEvents } from '../../events/JCEvents';
import { getSelectedLines, isRespinActive, isRowActive } from '../../models/JCLinesState';
import { resetRespins } from '../../models/JCRespinState';
import {
  getHoldField,
  getModifierMultipliers,
  getInitialStickyCells,
  getStopGrid,
  HoldFieldEntry,
  MetamorphicSymbol,
  ModifierMultiplier,
} from '../../models/JCSpinData';
import HoldNWinReel from './HoldNWinReel';
import { MYSTERY_REEL_CONFIG, MysteryReelResult } from './JCMysterySymbolModifier';

const COLUMN_EFFECT_SPINE = 'electr_effect';
const COLUMN_EFFECT_STATE = 'animation';
const BORDER_EFFECT_SPINE = 'saber_down';
const BORDER_EFFECT_STATE = 'animation';
// Three triangles rising up the column in turn, 0.17s apart, over one second. One rig covers a
// single column: all three of its bones sit on the same x.
const TRIANGLE_EFFECT_SPINE = 'triangle';
const TRIANGLE_EFFECT_STATE = 'animation';
// Below every reel, so a cell's own overlays still draw over its spinning strip.
const SPIN_LAYER_DEPTH = -1;
// Every symbol draws over a blank beside it. The boost's art overflows its cell, so it draws over
// the other symbols, and the mysteries over everything.
const REEL_DEPTH_BLANK = 0;
const REEL_DEPTH_SYMBOL = 1;
const REEL_DEPTH_OVERSIZED = 2;
const REEL_DEPTH_MYSTERY = 3;
const EFFECT_DEPTH = 4;
export interface HoldNWinPosition {
  column: number;
  row: number;
}

// Base spins carry a full grid; respin rounds carry only the collected cells.
export interface SpinResultPayload {
  grid?: string[][];
  holdField?: HoldFieldEntry[];
}

// value is in bet multiples, the units the backend sends.
export interface CollectTarget {
  column: number;
  row: number;
  value: number;
}

export interface MysteryReveal {
  position: number[];
  // What the strip lands on, which is the same prize read as a reel result.
  result: MysteryReelResult;
  // What the cell becomes once the mystery has hidden itself.
  symbol: string;
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
  // Column-major; missing cells fall back to BLANK_SYMBOL_NAME.
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
  triangleEffectScale?: number;
  triangleEffectOffsetY?: number;
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
  private readonly rowSpinLayers: Container[] = [];
  private readonly columnEffects: PixSpine[] = [];
  private readonly triangleEffects: PixSpine[] = [];
  private readonly borderEffects: PixSpine[] = [];
  private readonly initialReel: string[][] | undefined;
  private readonly spinTimeoutIds: any[] = [];
  private readonly stopTimeoutIds: any[] = [];
  private minDurationTimeoutId: any = null;
  // The bet and line count the grid's locks were made at - see rememberStickyContext.
  private stickyBet = 0;
  private stickyLines = 0;
  private minDurationElapsed = false;
  // createReels() places a symbol per cell as it goes, so the grid is only walkable once it ends.
  private reelsBuilt = false;
  private pendingFinalGrid: string[][] | null = null;
  private readonly disposers: (() => void)[] = [];

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
    this.restoreStickyCells();
    // START_SPIN fires before the BE round-trip; the result arrives later on SPIN_RESULT_RECEIVED.
    this.disposers.push(
      EventHandler.bind(SlotEvents.START_SPIN, this.onSpinStart.bind(this)),
      EventHandler.bind(JCEvents.SPIN_RESULT_RECEIVED, this.onSpinResultReceived.bind(this)),
      // Blanks already on the grid need re-checking on a line-count change, not just on placement.
      EventHandler.bind(JCEvents.SELECTED_LINES, this.refreshBlanksVisuals.bind(this)),
      // A cell is sticky for the bet and the line count it landed on, which is how the backend holds
      // it too - progressData.stickyState carries both. Change either and the locks come off and the
      // cells spin with the rest.
      EventHandler.bind(JCEvents.SELECTED_LINES, this.onStickyContextEvent.bind(this)),
      EventHandler.bind(SlotEvents.UPDATE_TOTALBET, this.onStickyContextEvent.bind(this)),
      EventHandler.bind(SlotEvents.RENDER_UNFINISHED_REEL, this.renderUnfinishedGrid.bind(this)),
      EventHandler.bind(JCEvents.SELECTED_LINES, this.refreshFigures.bind(this)),
      EventHandler.bind(SlotEvents.UPDATE_TOTALBET, this.refreshFigures.bind(this)),
    );
  }

  private refreshFigures(): void {
    this.forEachReel((reel) => reel.refreshFigures());
  }

  // The column, triangle and border effects are feature art, in SECONDARY, so they are built when it
  // arrives. The feature waits for that, and playEffects runs straight through an empty pool.
  protected onSecondaryAssetsLoaded(): void {
    super.onSecondaryAssetsLoaded();
    if (this.columnEffects.length) return;
    const data: HoldNWinReelsContainerData = this.configData.data ?? {};
    this.createColumnEffects(data);
    this.createTriangleEffects(data);
    this.createBorderEffects(data);
  }

  private createColumnEffects(data: HoldNWinReelsContainerData): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;

    for (let column = 0; column < this.columns; column++) {
      const effect = UIUtil.getSpineAnim(COLUMN_EFFECT_SPINE, { spineName: COLUMN_EFFECT_SPINE });
      effect.scale.set(data.columnEffectScale ?? 0.65);
      effect.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
      effect.y = data.columnEffectOffsetY ?? 0;
      effect.visible = false;
      // Hidden spines still tick - playEffects turns it on for as long as it plays.
      effect.setAutoUpdate(false);
      effect.label = 'Multi/SuperMultiEffect';
      effect.zIndex = EFFECT_DEPTH;
      this.columnEffects[column] = effect;
      this.addChild(effect);
    }
  }

  // One rig per column, centred on it like the column effects. Played by a Charged symbol in the
  // top panel, alongside that column's borders.
  private createTriangleEffects(data: HoldNWinReelsContainerData): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;

    for (let column = 0; column < this.columns; column++) {
      const effect = UIUtil.getSpineAnim(TRIANGLE_EFFECT_SPINE, { spineName: TRIANGLE_EFFECT_SPINE });
      effect.scale.set(data.triangleEffectScale ?? 1);
      effect.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
      effect.y = data.triangleEffectOffsetY ?? 0;
      effect.visible = false;
      // Hidden spines still tick - playEffects turns it on for as long as it plays.
      effect.setAutoUpdate(false);
      effect.label = 'TriangleEffect';
      effect.zIndex = EFFECT_DEPTH;
      this.triangleEffects[column] = effect;
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
      // Hidden spines still tick - playEffects turns it on for as long as it plays.
      effect.setAutoUpdate(false);
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

  // Every cash symbol in these columns moves one step up the charge ladder, all together. A cell
  // holding anything else, a blank included, is left where it is.
  public chargeColumns(columns: number[], onComplete?: () => void): void {
    const targets: { reel: HoldNWinReel; name: string }[] = [];
    columns.forEach((column) => {
      for (let row = 0; row < this.rows; row++) {
        const reel = this.getReel(column, row);
        const charged = CHARGE_LADDER[reel?.getSymbolName() ?? ''];
        if (charged) targets.push({ reel, name: charged });
      }
    });

    if (!targets.length) {
      onComplete?.();
      return;
    }

    let finished = 0;
    targets.forEach(({ reel, name }) =>
      reel.chargeSymbol(name, () => {
        finished++;
        if (finished < targets.length) return;
        // A C5 charged into a mystery jackpot has to start churning like the ones that landed as
        // one. Already-spinning cells are skipped, so the rest are untouched.
        this.startMysteryReels();
        onComplete?.();
      }),
    );
  }

  // Same, for the triangles rising up a column.
  public playTriangleEffects(columns: number[], onComplete?: () => void): void {
    this.playEffects(this.triangleEffects, columns, TRIANGLE_EFFECT_STATE, onComplete);
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
        effect.setAutoUpdate(false);
        finished++;
        if (finished === targets.length) onComplete?.();
      });
      effect.visible = true;
      effect.setAutoUpdate(true);
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

  // In reading order, which is the order their trails leave in.
  public getCollectTargets(): CollectTarget[] {
    const targets: CollectTarget[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const value = this.getReel(column, row)?.getCollectValue() ?? 0;
        if (value) targets.push({ column, row, value });
      }
    }
    return targets;
  }

  // Every boost on the grid, in the order the reels stop: column by column, top to bottom.
  public getBoostPositions(): HoldNWinPosition[] {
    const positions: HoldNWinPosition[] = [];
    this.forEachReel((reel, column, row) => {
      if (reel?.getSymbolName() === BOOST_SYMBOL_NAME) positions.push({ column, row });
    });
    return positions;
  }

  // What a boost collects from, in reading order - see BOOST_SOURCE_SYMBOL_NAMES.
  public getBoostSources(): HoldNWinPosition[] {
    const positions: HoldNWinPosition[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const name = this.getReel(column, row)?.getSymbolName();
        if (name && BOOST_SOURCE_SYMBOL_NAMES.includes(name)) positions.push({ column, row });
      }
    }
    return positions;
  }

  public settleBoostBadges(positions: HoldNWinPosition[]): void {
    positions.forEach(({ column, row }) => this.getReel(column, row)?.settleBoostBadge());
  }

  // All at once: the cells are independent, and one at a time would drag out the exit.
  public applyMultipliersToSymbols(onComplete?: () => void): void {
    const targets: HoldNWinReel[] = [];
    this.forEachReel((reel) => {
      if (reel?.getMultiplier()) targets.push(reel);
    });

    if (!targets.length) {
      onComplete?.();
      return;
    }

    let finished = 0;
    targets.forEach((reel) =>
      reel.applyMultiplierToSymbol(() => {
        finished++;
        if (finished === targets.length) onComplete?.();
      }),
    );
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

  // One cell at a time, so each reveal reads on its own - turbo reveals them together. beforeReveal
  // is the cell's lead-in, the trail down from the logo: its own reveal waits on it, the others
  // do not.
  public playMetamorphicSymbols(
    entries: MetamorphicSymbol[],
    onComplete?: () => void,
    beforeReveal?: (column: number, row: number, done: () => void) => void,
  ): void {
    const targets = entries
      .map(({ position, symbol }) => ({
        column: position[0],
        row: position[1],
        reel: this.getReel(position[0], position[1]),
        symbol,
      }))
      .filter(({ reel }) => !!reel);

    if (!targets.length) {
      onComplete?.();
      return;
    }

    const reveal = (target: (typeof targets)[number], done: () => void): void => {
      const show = () => target.reel.revealMetamorphicSymbol(target.symbol, done);
      if (!beforeReveal) {
        show();
        return;
      }
      beforeReveal(target.column, target.row, show);
    };

    if (appModel.turboMode) {
      let finished = 0;
      targets.forEach((target) =>
        reveal(target, () => {
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
      reveal(targets[index], () => revealNext(index + 1));
    };
    revealNext(0);
  }

  public startMysteryReels(): void {
    let index = 0;
    this.forEachReel((reel) => {
      if (!reel || !MYSTERY_SYMBOL_NAMES.includes(reel.getSymbolName()) || reel.isMysterySpinning()) return;
      reel.startMysteryReel(index++ * MYSTERY_REEL_CONFIG.staggerMs);
    });
  }

  public stopMysteryReels(): void {
    this.forEachReel((reel) => reel?.stopMysteryReel());
  }

  // Every mystery on the grid has been turning since the feature opened, so they come to rest one
  // after another rather than together: each cell plays its whole reveal before the next one lands.
  public revealMysterySymbols(entries: MysteryReveal[], onComplete?: () => void): void {
    const targets = entries
      .map(({ position, result, symbol }) => ({ reel: this.getReel(position[0], position[1]), result, symbol }))
      .filter(({ reel }) => !!reel);

    if (!targets.length) {
      onComplete?.();
      return;
    }

    const revealNext = (index: number): void => {
      if (index >= targets.length) {
        this.setReelsDimmed(false);
        onComplete?.();
        return;
      }
      const { reel, result, symbol } = targets[index];
      this.setReelsDimmed(true, reel);
      reel.revealMysterySymbol(result, symbol, () => revealNext(index + 1));
    };
    revealNext(0);
  }

  // Every reel but the one revealing steps back, so each reveal reads on its own.
  private setReelsDimmed(flag: boolean, except?: HoldNWinReel): void {
    this.forEachReel((reel) => reel?.setDimmed(flag && reel !== except));
  }

  public refreshBlanksVisuals(): void {
    this.forEachReel((reel) => reel.refreshBlanksVisual());
  }

  // Resume after a reconnect. corelib has no SlotReel here to answer RENDER_UNFINISHED_REEL, and
  // setUnfinishedInfo() has already pointed gameResult at the init response's unfinishedInfo - so
  // the grid arrives through the same field a live spin uses.
  private renderUnfinishedGrid(): void {
    const grid = this.toGrid({
      grid: getStopGrid(),
      holdField: getHoldField(),
    });
    if (grid) this.showGrid(grid);
    this.restoreMultipliers(getModifierMultipliers());
  }

  public showGrid(grid: string[][]): void {
    this.forEachReel((reel, column, row) => {
      const name = grid[column]?.[row];
      if (name) reel.showSymbol(name);
    });
    this.updateReelDepths();
  }

  // Reels are added column by column, so a cell's neighbours draw over whatever spills out of it.
  // Depth is held in zIndex rather than child order, so it survives anything that adds children
  // later - see the REEL_DEPTH tiers, with the effects above all of them.
  private updateReelDepths(): void {
    if (!this.reelsBuilt) return;
    this.forEachReel((reel) => {
      if (!reel) return;
      reel.zIndex = this.getReelDepth(reel.getSymbolName());
    });
  }

  private getReelDepth(name: string | null): number {
    if (!name || name === BLANK_SYMBOL_NAME) return REEL_DEPTH_BLANK;
    if (MYSTERY_SYMBOL_NAMES.includes(name)) return REEL_DEPTH_MYSTERY;
    if (OVERSIZED_SYMBOL_NAMES.includes(name)) return REEL_DEPTH_OVERSIZED;
    return REEL_DEPTH_SYMBOL;
  }

  private createReels(): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;
    const totalHeight = this.rows * this.symbolHeight + (this.rows - 1) * this.rowGap;
    const maskHeight = this.maskHeight ?? this.symbolHeight;
    const rowMasks = this.createRowSpinLayers();

    for (let column = 0; column < this.columns; column++) {
      this.reels[column] = [];
      for (let row = 0; row < this.rows; row++) {
        const reel = new HoldNWinReel({
          row,
          column,
          symbolWidth: this.symbolWidth,
          symbolHeight: this.symbolHeight,
          spinLayer: this.rowSpinLayers[row],
          landingOvershoot: this.landingOvershoot,
          onSymbolPlaced: () => this.updateReelDepths(),
          spinSpeedMultiplier: this.spinSpeedMultiplier,
          anticipationSpeedFactor: this.anticipationSpeedFactor,
        });
        reel.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
        reel.y =
          row * (this.symbolHeight + this.rowGap) -
          totalHeight / 2 +
          this.symbolHeight / 2 +
          (this.rowOffsetsY?.[row] ?? 0);
        // One window per cell, all in the row's single mask, so the reel gaps stay trimmed.
        rowMasks[row].rect(reel.x - this.symbolWidth / 2, reel.y - maskHeight / 2, this.symbolWidth, maskHeight);
        reel.showSymbol(this.initialReel?.[column]?.[row] ?? BLANK_SYMBOL_NAME);
        this.reels[column][row] = reel;
        this.addChild(reel);
      }
    }
    rowMasks.forEach((mask) => mask.fill(0xff0000));
    this.reelsBuilt = true;
    this.updateReelDepths();
  }

  // One masked layer per row, holding whichever of that row's strips are spinning right now - see
  // HoldNWinReel.setSpinMasked. Returns each row's mask, still empty, for createReels to draw.
  private createRowSpinLayers(): Graphics[] {
    const masks: Graphics[] = [];
    for (let row = 0; row < this.rows; row++) {
      const layer = new Container();
      layer.label = `rowSpinLayer${row}`;
      layer.zIndex = SPIN_LAYER_DEPTH;
      const mask = new Graphics();
      mask.label = `rowSpinMask${row}`;
      layer.addChild(mask);
      layer.mask = mask;
      // Shown only while a strip is in it - see HoldNWinReel.setSpinMasked.
      layer.visible = false;
      this.rowSpinLayers[row] = layer;
      this.addChild(layer);
      masks.push(mask);
    }
    return masks;
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
    // Empty counts as nothing to show, not as a grid of blanks: outside the feature there is no
    // holdField at all, and a round that holds nothing can't have been sent.
    if (!result?.holdField?.length) return null;

    const grid: string[][] = [];
    for (let column = 0; column < this.columns; column++) {
      grid[column] = new Array(this.rows).fill(BLANK_SYMBOL_NAME);
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
      if (isRespinActive()) {
        this.holdFilledCells();
        // A mystery that just landed joins the ones already churning - they all land together on
        // the round that closes the feature.
        this.startMysteryReels();
      } else {
        this.lockStickySymbols();
      }
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

  // Base game only: a sticky symbol chains its cell shut, so it survives the following spins
  // until the feature starts. Already-locked cells are left alone so the lock does not replay.
  // What the locks currently on the grid belong to. Compared rather than trusting the event
  // itself: UPDATE_TOTALBET is also dispatched at startup and around promo spins, where the bet
  // has not actually moved and a restored lock has to survive.
  private rememberStickyContext(): void {
    this.stickyBet = appModel.getTotalBet();
    this.stickyLines = getSelectedLines();
  }

  private onStickyContextEvent(): void {
    if (appModel.getTotalBet() === this.stickyBet && getSelectedLines() === this.stickyLines) return;
    this.releaseStickyCells();
  }

  public lockStickySymbols(): void {
    this.rememberStickyContext();
    this.forEachReel((reel) => {
      if (reel.isSticky() || !STICKY_SYMBOL_NAMES.includes(reel.getSymbolName() ?? '')) return;
      reel.setSticky(true);
      reel.playChainLockAppear();
    });
  }

  // Cells the backend was still holding when the player last left, placed and locked as the grid
  // is built. Nothing spins them back in: they are simply already there.
  private restoreStickyCells(): void {
    this.rememberStickyContext();
    getInitialStickyCells().forEach(({ position, symbol }) => {
      const reel = this.getReel(position[0], position[1]);
      // A name this build has no art for would throw out of the symbol pool.
      if (!reel || !SYMBOLS_DATA[symbol]) return;
      reel.showSymbol(symbol);
      reel.setSticky(true);
      reel.playChainLockAppear();
    });
    this.updateReelDepths();
  }

  // Called on entering the respin, and whenever the bet or the line count changes. A cell is free
  // the moment this runs; the chain coming apart plays out behind it.
  public releaseStickyCells(): void {
    this.forEachReel((reel) => {
      if (reel.isSticky()) reel.playChainLockDisappear();
    });
  }

  // A cell already holding a symbol sits out the remaining respin rounds. Nothing to do with the
  // sticky/chain-lock mechanic - it only stops the cell taking part. Called when the feature starts
  // and again after every round settles.
  public holdFilledCells(): void {
    this.forEachReel((reel) => {
      if (reel.getSymbolName() !== BLANK_SYMBOL_NAME) reel.setHeld(true);
    });
  }

  public releaseAllCells(): void {
    this.forEachReel((reel) => reel.setHeld(false));
  }

  public getFilledCount(): number {
    let count = 0;
    this.forEachReel((reel) => {
      if (reel.getSymbolName() !== BLANK_SYMBOL_NAME) count++;
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

    const pending: { reel: HoldNWinReel; symbolName: string; column: number; row: number }[] = [];
    this.forEachReel((reel, column, row) => {
      if (reel.isSticky() || reel.isHeld()) return;
      pending.push({ reel, symbolName: finalGrid[column][row], column, row });
    });

    // The spin loop starts on START_SPIN and only this stops it - corelib's SlotReel, which would,
    // isn't used here. Sent as the last cell lands, as SlotReel does.
    if (pending.length === 0) {
      EventHandler.dispatchEvent(SlotEvents.STOP_REEL_SPIN_SOUND);
      onComplete?.();
      return;
    }

    let settledCount = 0;
    pending.forEach(({ reel, symbolName, column, row }, index) => {
      const delay = index * this.stopGap + (reel.isAnticipating() ? this.anticipationDelay : 0);
      this.stopTimeoutIds.push(
        setTimeout(() => {
          reel.stopSpin(symbolName, () => {
            // On this cell's own landing, not once the whole grid has settled: the reels stop
            // one after another, and a trail that waited would be seconds late.
            this.requestTrail(column, row);
            this.onRespinCellLanded(column, row);
            settledCount++;
            if (settledCount === pending.length) {
              EventHandler.dispatchEvent(SlotEvents.STOP_REEL_SPIN_SOUND);
              onComplete?.();
            }
          });
        }, delay),
      );
    });
  }

  // Inside the feature only held cells sit out a round, so any symbol landing in a spinning cell is
  // a new one, and it gives the counter its full count back as it lands.
  private onRespinCellLanded(column: number, row: number): void {
    if (!isRespinActive()) return;
    const name = this.getReel(column, row)?.getSymbolName();
    if (!name || name === BLANK_SYMBOL_NAME) return;
    EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, resetRespins());
  }

  // Base game only, and only for a symbol that earns one on an active payline.
  private requestTrail(column: number, row: number): void {
    if (isRespinActive() || !isRowActive(row)) return;
    const name = this.getReel(column, row)?.getSymbolName();
    if (!name || !TRAIL_SYMBOL_NAMES.includes(name)) return;
    EventHandler.dispatchEvent(JCEvents.PLAY_TRAIL_ANIMATION, { column, row });
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
      // A held cell never spins, so it never settles to clear the effect again.
      const reel = this.getReel(lastColumn, row);
      if (lineLive && !reel?.isSticky() && !reel?.isHeld()) positions.push({ column: lastColumn, row });
    }
    return positions;
  }

  private hasLandedSymbol(finalGrid: string[][], column: number, row: number): boolean {
    const name = finalGrid[column]?.[row];
    return !!name && name !== BLANK_SYMBOL_NAME;
  }

  private clearTimeouts(ids: any[]): void {
    ids.forEach((id) => clearTimeout(id));
    ids.length = 0;
  }

  public destroyView(): void {
    this.disposers.forEach((dispose) => dispose());
    this.disposers.length = 0;
    this.clearTimeouts(this.spinTimeoutIds);
    this.clearTimeouts(this.stopTimeoutIds);
    clearTimeout(this.minDurationTimeoutId);
    // destroy() alone leaves a spine on the ticker.
    [...this.columnEffects, ...this.triangleEffects, ...this.borderEffects].forEach((effect) => effect?.destroySpine());
    // The layers go without their children, which the reels take back as they are destroyed, so
    // the masks are destroyed by hand.
    const masks = this.rowSpinLayers.map((layer) => layer.mask as Graphics | null);
    super.destroyView();
    masks.forEach((mask) => mask?.destroy());
  }
}
