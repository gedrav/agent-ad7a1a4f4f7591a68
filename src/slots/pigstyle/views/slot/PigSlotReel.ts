import { Elastic } from 'gsap/gsap-core';
import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import PigReelSymbol from '@game/views/slot/PigReelSymbol';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { WildsComp } from '@game/views/comps/WildsComp';

const customEase = Elastic.easeOut.config(1.4, 0.6);
const quickStopEase = Elastic.easeOut.config(0.8, 0.4);
const QUICK_STOP_DURATION = 0.15;

export class PigSlotReel extends SlotReelStandard {
  protected reelRows: number[];
  protected symbolHeights: number[];

  protected get wildsComp(): WildsComp {
    return this.elementsList['wildsComp'];
  }

  public getRowCount(reelno: number): number {
    return this.reelRows?.[reelno] ?? this.reelsData.initialReel[reelno].length;
  }

  protected setRowCount(reelno: number, rows: number): void {
    this.reelRows ??= [];
    this.symbolHeights ??= [];
    this.reelRows[reelno] = rows;
    this.symbolHeights[reelno] = this.measureSymbolHeight(rows);
  }

  protected getSymbolHeight(reelno: number): number {
    return this.symbolHeights?.[reelno] ?? this.measureSymbolHeight(this.getRowCount(reelno));
  }

  protected measureSymbolHeight(rowCount: number): number {
    return UIUtil.getTexture(`${this.getTileImage()}${rowCount}`).height * this.getSymbolScale() * 0.98;
  }

  protected getTileImage(): string {
    return appModel.getIsFreeSpinsSession() ? this.reelsData.tileImageFS : this.reelsData.tileImage;
  }

  public cellCentre(reelno: number, row: number, rowCount: number): { x: number; y: number } {
    const scale = this.getSymbolScale();
    const tile = UIUtil.getTexture(`${this.getTileImage()}${rowCount}`);
    return {
      x: this.reelsData.reelPositionX[reelno] + (tile.width * scale) / 2,
      y: row * this.measureSymbolHeight(rowCount) + (tile.height * scale) / 2,
    };
  }

  protected getSymbolConfig(name: string, reelno: number): any {
    const data = this.reelsData.symbolsData[name];
    if (!data) return null;

    const rowCount = this.getRowCount(reelno);
    let skin = data.skin;

    if (data.sized && skin?.includes('x')) {
      const size = rowCount - 1;
      skin = skin.replace('x', size.toString());
    }

    return { ...data, rowCount, skin, tileImage: this.getTileImage() };
  }

  public getSymbolScale(): number {
    return this.reelsData.symbolScale;
  }

  public getWildConfig(): any {
    return this.reelsData.symbolsData[this.reelsData.wildSymbol];
  }

  public getSlideFrames(): any {
    return this.reelsData.slideFrames;
  }

  protected getWildEntries(): number[][] {
    const result = appModel.gameResult;
    return result?.positionsModifiedWithWc ?? result?.wildMultipliers ?? [];
  }

  protected isFeatureRound(featureId: string): boolean {
    return appModel.getIsFreeSpinsSession() && (appModel.getFeatureSubType() ?? '').includes(featureId);
  }

  protected isRainingRound(): boolean {
    return this.isFeatureRound(this.reelsData.rainingFeatureId);
  }

  protected isStickyRound(): boolean {
    return this.isFeatureRound(this.reelsData.stickyFeatureId);
  }

  protected rotateStripSymbol(symbols: any[], symbolHeight: number): void {
    const last = symbols.pop();
    last.y = symbols[0].y - symbolHeight;
    symbols.unshift(last);
  }

  protected moveSymbols(symbols: any[], delta: number): void {
    symbols.forEach((symb) => (symb.y += this.spinningSpeed * delta));
  }

  protected getNextSymbol(reelno: number) {
    const data: any = { ...this.getSymbolConfig(this.getNextSymbolName(reelno), reelno), reelNumber: reelno };
    return new this.reelsData.symbolClass({ data: data });
  }

  protected getNextSymbolData(reelno: number) {
    return this.getSymbolConfig(this.getNextSymbolName(reelno), reelno);
  }

  protected getFirstTimeSymbol(reelno: number, rowIndex: number) {
    if (rowIndex === 0 || rowIndex > this.getRowCount(reelno)) {
      return this.getNextSymbol(reelno);
    }
    const symbol = this.reelsData.initialReel[reelno][rowIndex - 1];
    const data: any = { ...this.getSymbolConfig(symbol, reelno), reelNumber: reelno };
    return new this.reelsData.symbolClass({ data: data });
  }

  public swapSymbol(reelno: number, row: number, name: string): void {
    this.symbolsArray[reelno][row].setNewSymbol(this.getSymbolConfig(name, reelno), reelno);
  }

  public createFinalReelSymbols(): void {
    const reels = appModel.gameResult?.reelView;
    this.finalSymbols = [];
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      const reel = reels?.[k];
      if (reel?.length) {
        this.setRowCount(k, Math.min(reel.length, this.reelsData.noOfRows));
        this.finalSymbols[k] = [this.getRandomSymbolName(k), ...reel, this.getRandomSymbolName(k)];
      } else {
        this.finalSymbols[k] = [...this.defaultReel[k]];
      }
      (this as any).stopIndex[k] = this.finalSymbols[k].length - 1;
    }
    this.applyWildPositions();
    this.wildsComp?.showStickyWilds(this.getWildEntries(), this.isStickyRound(), this);
  }

  protected applyWildPositions(): void {
    for (const [reelno, row] of this.getWildEntries()) {
      const strip = this.finalSymbols[reelno];
      if (strip && row + 1 < strip.length - 1) {
        strip[row + 1] = this.reelsData.wildSymbol;
      }
    }
  }

  protected startStoppingSpin(): void {
    const entries = this.getWildEntries();
    if (this.isRainingRound() && entries.length) {
      this.wildsComp.showRainingWilds(entries, this, () => super.startStoppingSpin());
      return;
    }
    super.startStoppingSpin();
  }

  protected renderUnfinishedReel(): void {
    const reels = appModel.gameResult?.reelView;
    if (!reels) {
      return;
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      if (!reels[k]?.length) {
        continue;
      }
      this.setRowCount(k, Math.min(reels[k].length, this.reelsData.noOfRows));
      for (let j = 1; j <= this.getRowCount(k); j++) {
        this.symbolsArray[k][j].setNewSymbol(this.getSymbolConfig(reels[k][j - 1], k), k);
      }
    }
    this.repositionView();
    this.showHideExtraSymbols(false);
    this.showIdleAnim(false);
  }

  protected doSpinning(reelno: number, delta: number): void {
    const symbols = this.symbolsArray[reelno];
    this.spinningSpeed = Math.min(this.spinningSpeed + this.speedFactor, this.maxSpeed);
    this.moveSymbols(symbols, delta);

    const symbolHeight = this.getSymbolHeight(reelno);
    for (let pass = 0; pass < symbols.length; pass++) {
      if (symbols[symbols.length - 1].y <= this.reelsData.reelHeight) {
        break;
      }
      symbols[symbols.length - 1].setNewSymbol(this.getNextSymbolData(reelno), reelno);
      this.rotateStripSymbol(symbols, symbolHeight);
      if (this.anticipationRunning[reelno] || this.currentReel == reelno) {
        this.symbolPassedCounterArray[reelno]++;
        this.checkToStopReelStrip(reelno);
      }
    }
  }

  protected stoppingReelStrip(reelno: number, delta: number): void {
    const symbols = this.symbolsArray[reelno];
    this.spinningSpeed = Math.max(this.spinningSpeed - this.speedFactor, this.minSpeed);
    this.moveSymbols(symbols, delta);

    const symbolHeight = this.getSymbolHeight(reelno);
    const self = this as any;

    for (let pass = 0; pass < symbols.length; pass++) {
      if (symbols[symbols.length - 1].y <= this.reelsData.reelHeight * 1.1) {
        break;
      }

      if (self.stopIndex[reelno] < 0) {
        this.reelSpinningState[reelno] = 4;
        break;
      }

      const data = this.getSymbolConfig(this.finalSymbols[reelno][self.stopIndex[reelno]--], reelno);
      if (data == null) {
        throw new Error('There is no new symbol to spin on the queue.');
      }

      const last = symbols[symbols.length - 1];
      last.setNormalTexture();
      last.setNewSymbol(data, reelno);
      this.rotateStripSymbol(symbols, symbolHeight);
    }
  }

  protected showFinalJerk(reelno: number): void {
    this.destroyAnticipation(reelno);
    this.anticipationRunning[reelno] = false;
    this.reelSpinningState[reelno] = 0;

    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;
    const symbolHeight = this.getSymbolHeight(reelno);
    const rows = this.getRowCount(reelno);
    const self = this as any;

    this.showLandinAnimation(reelno);
    for (let k = 0; k < len; k++) {
      if (k > 0 && k <= rows) {
        const symbolName = symbols[k].getSymbolName();

        if (self.landingSymbolsCount[symbolName]) {
          const count = self.landingSymbolsCount[symbolName][1];
          self.landingSymbolsCount[symbolName][1]++;
          EventHandler.dispatchEvent(`PLAY_SYMBOL_${symbolName}_LANDING_SOUND`, count + 1);
        }
      }
      AnimationProxy.animateTween(symbols[k], {
        y: (k - 1) * symbolHeight,
        duration: appModel.turboMode ? this.jerkDuration * 0.5 : this.jerkDuration,
        ease: customEase,
        ...(k === len - 1 ? { onComplete: this.onReelStripStopped.bind(this, reelno) } : {}),
      });
    }
    EventHandler.dispatchEvent(SlotEvents.PLAY_STRIP_JERK_SOUND);
    if (reelno == this.reelsData.noOfReels - 1) {
      EventHandler.dispatchEvent(SlotEvents.STOP_REEL_SPIN_SOUND);
    }
  }

  protected stopReelQuick(reelno: number): void {
    this.destroyAnticipation(reelno);
    this.anticipationRunning[reelno] = false;

    EventHandler.dispatchEvent(SlotEvents.PLAY_STRIP_JERK_SOUND);
    this.reelSpinningState[reelno] = 0;

    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;
    const symbolHeight = this.getSymbolHeight(reelno);

    for (let k = 0; k < len; k++) {
      symbols[k].setNormalTexture();
      symbols[k].cleanUpSymbolWin();
      AnimationProxy.killTweensOf(symbols[k]);
      symbols[k].visible = true;
      const data = this.getSymbolConfig(this.finalSymbols[reelno]?.[k], reelno);
      if (data) {
        symbols[k].setNewSymbol(data, reelno);
      }
      AnimationProxy.animateTween(symbols[k], {
        y: (k - 1) * symbolHeight,
        duration: QUICK_STOP_DURATION,
        ease: quickStopEase,
        ...(k === len - 1 ? { onComplete: this.onReelStripStopped.bind(this, reelno) } : {}),
      });
    }
    if (reelno == this.reelsData.noOfReels - 2) {
      EventHandler.dispatchEvent(SlotEvents.STOP_REEL_SPIN_SOUND);
    }
  }

  protected onReelStripStopped(reelno: number): void {
    if (!this.isStickyRound()) {
      for (const [wildReel, row, multiplier] of this.getWildEntries()) {
        const symb = this.symbolsArray[wildReel]?.[row + 1] as PigReelSymbol;
        if (wildReel === reelno && symb?.getSymbolName() === this.reelsData.wildSymbol) {
          symb.setRewardData(multiplier);
        }
      }
    }
    super.onReelStripStopped(reelno);
    if (this.isRainingRound() && this.numberOfStoppedReels === this.reelsData.noOfReels) {
      this.wildsComp?.clearWilds();
    }
  }

  protected onFreeSpinsEnded(): void {
    const tileImage = this.getTileImage();
    for (const reel of this.symbolsArray) {
      for (const symb of reel) {
        (symb as PigReelSymbol).setTileImage(tileImage);
      }
    }
  }

  protected showHideExtraSymbols(flag: boolean = false): void {
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      const rows = this.getRowCount(k);
      this.symbolsArray[k].forEach((symb, j) => (symb.visible = (j > 0 && j <= rows) || flag));
    }
  }

  protected repositionView(): void {
    this.setDeviceWisePositionData();
    const scale = this.reelsData.symbolScale;

    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      const oldSymbolHeight = this.getSymbolHeight(k);

      if (this.symbolHeights) {
        this.symbolHeights[k] = this.measureSymbolHeight(this.getRowCount(k));
      }
      const newSymbolHeight = this.getSymbolHeight(k);
      const isSpinning = this.reelSpinningState && this.reelSpinningState[k] > 0;

      this.symbolsArray[k].forEach((symb, j) => {
        symb.scale.set(scale);
        symb.x = this.reelsData.reelPositionX[k];

        if (isSpinning) {
          symb.y = (symb.y / oldSymbolHeight) * newSymbolHeight;
        } else {
          symb.y = (j - 1) * newSymbolHeight;
        }
      });
    }

    const pos = this.reelsData.reelContainerPos;
    for (const view of [this.symbolsContainer, this.winSymbolsContainer, this.anticipationContainer, this.wildsComp]) {
      view?.position.set(pos.x, pos.y);
    }
  }

  protected createScatterAnticipationArray(): void {
    const reels = appModel.gameResult?.reelView;
    if (!reels) {
      super.createScatterAnticipationArray();
      return;
    }

    let totalScatters = 0;
    this.scatterAnticipArray = [];
    this.scatterAnticipArray[0] = [0];

    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      if (k > 0) {
        const prevReel = reels[k - 1];
        if (prevReel) {
          const scattersLen = this.reelsData.anticipationSymbols?.length;
          if (scattersLen) {
            for (let i = 0; i < prevReel.length; i++) {
              for (let j = 0; j < scattersLen; j++) {
                if (prevReel[i] === this.reelsData.anticipationSymbols[j]) {
                  totalScatters++;
                }
              }
            }
          }
        }
      }
      this.scatterAnticipArray[k] = [totalScatters];
    }
  }

  public showSpinWin(): void {
    this.applyStickyMultipliersToReels();
    super.showSpinWin();
  }

  public showLineWin(): void {
    this.applyStickyMultipliersToReels();
    super.showLineWin();
  }

  public showTumbleWin(): void {
    this.applyStickyMultipliersToReels();
    super.showTumbleWin();
  }

  protected applyStickyMultipliersToReels(): void {
    if (this.isStickyRound()) {
      for (const [wildReel, row, multiplier] of this.getWildEntries()) {
        const symb = this.symbolsArray[wildReel]?.[row + 1] as PigReelSymbol;
        if (symb && symb.getSymbolName() === this.reelsData.wildSymbol) {
          if (!(symb as any).multiplier) {
            symb.setRewardData(multiplier);
          }
        }
      }
    }
  }
}
