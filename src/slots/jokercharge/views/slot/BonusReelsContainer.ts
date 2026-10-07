import { Container, Graphics } from 'pixi.js';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { BLANK_BONUS_SYMBOL_NAME, resolveBonusSymbolName } from '../../config/BonusSymbolsConfig';
import { JCEvents } from '../../events/JCEvents';
import { isRespinActive } from '../../models/JCLinesState';
import { getModifierRow } from '../../models/JCSpinData';
import BonusReel from './BonusReel';

export interface BonusReelsContainerData {
  columns: number;
  symbolWidth: number;
  symbolHeight: number;
  symbolScale: number;
  reelGap?: number;
  spinStartGap?: number;
  stopGap?: number;
  spinSpeedMultiplier?: number;
  // Floor on how long a spin visibly runs before it's allowed to stop, in ms.
  minSpinDuration?: number;
  minSpinDurationTurbo?: number;
  // One entry per column; missing cells fall back to the blank tile.
  initialReel?: string[];
}

// The bonus round's top-panel reels, centred on this Comp's origin so it sits over top_panel_bg.
// Visibility rides the bonus layout's alpha (see BonusTriggerLayoutConfig); spin()/stopSpin() are
// called by whoever knows the round's result.
export class BonusReelsContainer extends ResponsiveChildrenView {
  private readonly columns: number;
  private readonly symbolWidth: number;
  private readonly reelGap: number;
  private readonly spinStartGap: number;
  private readonly stopGap: number;
  private readonly minSpinDuration: number;
  private readonly minSpinDurationTurbo: number;
  private readonly reels: BonusReel[] = [];
  private readonly spinTimeoutIds: any[] = [];
  private readonly stopTimeoutIds: any[] = [];
  private minDurationTimeoutId: any = null;
  private minDurationElapsed = false;
  private pendingFinalSymbols: string[] | null = null;

  constructor(configData: any) {
    super(configData);
    const data: BonusReelsContainerData = this.configData.data ?? {};
    this.columns = data.columns;
    this.symbolWidth = data.symbolWidth;
    this.reelGap = data.reelGap ?? 0;
    this.spinStartGap = data.spinStartGap ?? 0;
    this.stopGap = data.stopGap ?? 0;
    this.minSpinDuration = data.minSpinDuration ?? 2000;
    this.minSpinDurationTurbo = data.minSpinDurationTurbo ?? 750;
    this.createReels(data);
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.onSpinStart.bind(this));
    EventHandler.addEventListener(JCEvents.TOP_REEL_RESULT_RECEIVED, this.onResultReceived.bind(this));
    EventHandler.addEventListener(SlotEvents.RENDER_UNFINISHED_REEL, this.renderUnfinishedRow.bind(this));
  }

  // Resume after a reconnect - see HoldNWinReelsContainer.renderUnfinishedGrid().
  private renderUnfinishedRow(): void {
    const modifierRow = getModifierRow();
    if (modifierRow) this.showSymbols(modifierRow.map(resolveBonusSymbolName));
  }

  // Only spins inside the feature - in the base game the panel is hidden and takes no part.
  private onSpinStart(): void {
    if (!isRespinActive()) return;
    this.spin();
    this.minDurationElapsed = false;
    this.pendingFinalSymbols = null;

    const minDuration = appModel.turboMode ? this.minSpinDurationTurbo : this.minSpinDuration;
    clearTimeout(this.minDurationTimeoutId);
    this.minDurationTimeoutId = setTimeout(() => {
      this.minDurationElapsed = true;
      this.tryStopSpin();
    }, minDuration);
  }

  private onResultReceived(modifierRow: string[]): void {
    if (!modifierRow) return;
    // The spin that triggers the feature already carries the round's opening row. The panel isn't
    // spinning yet and is still hidden, so it's placed outright and is there when the transition
    // reveals it.
    if (!isRespinActive()) {
      if (appModel.getNextFeatureType() === CONSTANTS.FEATURE_TYPE_RESPIN) {
        this.showSymbols(modifierRow.map(resolveBonusSymbolName));
      }
      return;
    }
    this.pendingFinalSymbols = modifierRow.map(resolveBonusSymbolName);
    this.tryStopSpin();
  }

  // Stops once both the min duration has elapsed and a response has arrived, whichever is last.
  private tryStopSpin(): void {
    if (!this.minDurationElapsed || !this.pendingFinalSymbols) return;
    const symbols = this.pendingFinalSymbols;
    this.pendingFinalSymbols = null;
    this.stopSpin(symbols);
  }

  private createReels(data: BonusReelsContainerData): void {
    const totalWidth = this.columns * this.symbolWidth + (this.columns - 1) * this.reelGap;

    // One mask for the whole panel: every spinning strip is drawn in this layer. Added first, so
    // it sits under the reels.
    const spinLayer = new Container();
    spinLayer.label = 'bonusSpinLayer';
    const spinMask = new Graphics();
    spinMask.label = 'bonusSpinMask';
    spinLayer.addChild(spinMask);
    spinLayer.mask = spinMask;
    this.addChild(spinLayer);

    for (let column = 0; column < this.columns; column++) {
      const reel = new BonusReel({
        column,
        symbolHeight: data.symbolHeight,
        spinLayer,
        symbolScale: data.symbolScale,
        spinSpeedMultiplier: data.spinSpeedMultiplier,
        initialSymbol: data.initialReel?.[column] ?? BLANK_BONUS_SYMBOL_NAME,
      });
      reel.x = column * (this.symbolWidth + this.reelGap) - totalWidth / 2 + this.symbolWidth / 2;
      // One window per cell, so the reel gaps stay trimmed as they were with a mask per reel.
      spinMask.rect(reel.x - this.symbolWidth / 2, -data.symbolHeight / 2, this.symbolWidth, data.symbolHeight);
      this.reels[column] = reel;
      this.addChild(reel);
    }
    spinMask.fill(0xff0000);
  }

  public getReel(column: number): BonusReel {
    return this.reels[column];
  }

  public forEachReel(callback: (reel: BonusReel, column: number) => void): void {
    this.reels.forEach((reel, column) => callback(reel, column));
  }

  public getSymbolName(column: number): string | null {
    return this.reels[column]?.getSymbolName() ?? null;
  }

  public showSymbols(names: string[]): void {
    this.forEachReel((reel, column) => reel.showSymbol(names[column] ?? BLANK_BONUS_SYMBOL_NAME));
  }

  public spin(): void {
    this.clearTimeouts(this.spinTimeoutIds);
    this.forEachReel((reel, column) => {
      this.spinTimeoutIds.push(setTimeout(() => reel.spin(), column * this.spinStartGap));
    });
  }

  // onComplete fires once every reel has settled, not when they were told to stop.
  public stopSpin(finalSymbols: string[], onComplete?: () => void): void {
    this.clearTimeouts(this.stopTimeoutIds);
    let settledCount = 0;
    this.forEachReel((reel, column) => {
      this.stopTimeoutIds.push(
        setTimeout(() => {
          reel.stopSpin(finalSymbols[column] ?? BLANK_BONUS_SYMBOL_NAME, () => {
            settledCount++;
            if (settledCount === this.reels.length) {
              onComplete?.();
            }
          });
        }, column * this.stopGap),
      );
    });
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
