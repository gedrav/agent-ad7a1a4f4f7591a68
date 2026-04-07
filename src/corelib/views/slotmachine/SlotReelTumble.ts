import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import SlotReel from '@core/views/slotmachine/SlotReel';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { gsap } from 'gsap';
type BlastSymbol = {
  reelIndex: number;
  rowIndex: number;
  symbol: ReelSymbolSprite;
  initialScaleX: number;
  initialScaleY: number;
};

type ConvertedJWildPosition = {
  position: [number, number];
  prevSymbol: string;
};

export default class SlotReelTumble extends SlotReel {
  protected pendingBlastAnimations = 0;
  protected pendingJwdAnimations = 0;
  private pendingAppearingAnimations: number;

  constructor(configData: any) {
    super(configData);
  }

  public resetReelForError(): void {
    gsap.globalTimeline.clear();
    this.ticker.stop();
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      for (let i = 0; i < this.reelsData.noOfRows + 2; i++) {
        const symb = this.symbolsArray[k][i];
        const newSymbolData = this.getNextSymbolData(k);
        symb.setNewSymbol(newSymbolData, k);
        symb.setNormalTexture();
        symb.y = this.reelsData.symbolPositionY ? this.reelsData.symbolPositionY[i] : i * this.reelsData.symbolHeight;
      }
    }
    EventHandler.dispatchEvent(SlotEvents.REELSPIN_COMPLETED);
  }
  protected stopSpinQuick(): void {
    if (!this.spinStarted || !appModel.gameResult) return;

    this.ticker.stop();
    this.quickSpinStarted = true;

    // Stop all reels immediately
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.stopReelQuick(k);
    }
  }
  protected startStoppingSpin(): void {
    if (this.quickSpinStarted) return;
    if (appModel.turboMode) {
      this.stopSpinQuick();
      return;
    }

    const reels = appModel.getCascadeReelsView();
    if (!reels) {
      console.error('CASCADE: ReelsView is undefined!');
      return;
    }

    const stopGap = appModel.turboMode ? this.reelStopGap * 0.25 : this.reelStopGap;
    this.finalSymbols.forEach((_, reelIndex) =>
      setTimeout(this.stopReelStrip.bind(this, reelIndex), stopGap * reelIndex),
    );
  }

  private getBlastSymbols(tumblePositions: number[][]): BlastSymbol[] {
    if (!tumblePositions?.length) return [];

    return tumblePositions.reduce<BlastSymbol[]>((acc, [reelIndex, rowIndex]) => {
      const symbol = this.symbolsArray?.[reelIndex]?.[rowIndex + 1];
      if (!symbol) return acc;

      acc.push({
        reelIndex,
        rowIndex,
        symbol,
        initialScaleX: symbol.scale.x,
        initialScaleY: symbol.scale.y,
      });

      return acc;
    }, []);
  }
}
