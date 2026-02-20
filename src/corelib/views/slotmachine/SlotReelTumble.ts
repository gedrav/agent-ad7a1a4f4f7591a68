import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import SlotReel from '@core/views/slotmachine/SlotReel';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
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
  protected multiplierComp: MultiplierComp;
  private pendingAppearingAnimations: number;

  constructor(configData: any) {
    super(configData);
    this.multiplierComp = this.elementsList['multiplierComp'];
    EventHandler.addEventListener(SlotEvents.BLAST_SYMBOLS, this.showBlastAnim.bind(this));
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

  protected showBlastAnim(): void {
    const tumbleData = appModel.getSpinBlastData();
    const tumblePositions = Util.combineBlastPoisitions(tumbleData);
    const blastSymbols = this.getBlastSymbols(tumblePositions);

    if (!blastSymbols.length) {
      this.introduceNewSymbols([]);
      return;
    }
    this.pendingBlastAnimations = blastSymbols.length;
    blastSymbols.forEach((blast) => {
      blast.symbol.showBlastAnim(() => this.onBlastAnimComplete(blastSymbols));
    });
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

  protected onBlastAnimComplete(blastSymbols: BlastSymbol[]): void {
    this.pendingBlastAnimations -= 1;
    if (this.pendingBlastAnimations > 0) return;
    blastSymbols.forEach(({ symbol, initialScaleX, initialScaleY }) => {
      symbol.scale.set(initialScaleX, initialScaleY);
      symbol.visible = false;
    });
    this.multiplierComp.setMultiplierLvl(appModel.tumbleIndex + 2); // +2 since lvl starts from 1 and aft blast the win multiplier increases by 1
    this.introduceNewSymbols(blastSymbols);
  }

  protected introduceNewSymbols(blastSymbols: BlastSymbol[]): void {
    const reelsView = appModel.getNextCascadeReelsView();
    if (!reelsView) {
      console.error('CASCADE: ReelsView is undefined!');
      return;
    }
    this.pendingAppearingAnimations = blastSymbols.length;
    blastSymbols?.forEach(({ symbol, reelIndex, rowIndex }) => {
      symbol.visible = true;
      symbol.replaceSymbol(reelsView[reelIndex][rowIndex], () => this.onNewSymbolsAppeared());
    });
  }
  protected onNewSymbolsAppeared(): void {
    this.pendingAppearingAnimations--;
    if (this.pendingAppearingAnimations <= 0) {
      this.checkIfJWildConverted();
    }
  }

  protected checkIfJWildConverted(): void {
    const convertedJWildPositions = appModel.getConvertedJWildPositions() as ConvertedJWildPosition[];
    const landedJWildPositions = appModel.getLandedJWildPositions() as ConvertedJWildPosition[];

    const convertedPositions = (convertedJWildPositions ?? [])
      .map((e) => e?.position)
      .filter((p): p is [number, number] => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite));

    const landedPositions = (landedJWildPositions ?? [])
      .map((e) => e?.position)
      .filter((p): p is [number, number] => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite));

    if (!convertedPositions.length) {
      StateManager.doNextStep();
      return;
    }
    this.replaceOtherSymbolsWithJWild(convertedPositions, landedPositions);
  }

  protected async replaceOtherSymbolsWithJWild(
    convertedPositions: [number, number][],
    landedPositions: [number, number][],
  ): Promise<void> {
    const reelsView = appModel.getNextCascadeReelsView();

    if (!reelsView || !landedPositions?.length) {
      console.error('CASCADE: ReelsView or landedPositions is undefined!');
      StateManager.doNextStep();
      return;
    }

    const animSymbols: ReelSymbolSprite[] = [];
    this.pendingJwdAnimations = convertedPositions.length;

    convertedPositions.forEach(([fromReel, fromRow], i) => {
      const toConvertedJWSymb = convertedPositions[i];
      const fromLandedJWSymb = landedPositions[0];
      if (!fromLandedJWSymb || !toConvertedJWSymb) {
        this.pendingJwdAnimations--;
        return;
      }

      const landedWildSymbol = this.symbolsArray[fromLandedJWSymb[0]][fromLandedJWSymb[1] + 1];
      const movingSymb = new ReelSymbolSprite({ data: { name: 'JWD' } });

      movingSymb.scale.set(landedWildSymbol.scale.x, landedWildSymbol.scale.y);
      movingSymb.x = landedWildSymbol.x;
      movingSymb.y = landedWildSymbol.y;

      this.symbolsContainer.addChild(movingSymb);
      animSymbols.push(movingSymb);

      AnimationProxy.animateTween(movingSymb, {
        duration: 1,
        delay: 0.5,
        x: this.symbolsArray[toConvertedJWSymb[0]][toConvertedJWSymb[1] + 1].x,
        y: this.symbolsArray[toConvertedJWSymb[0]][toConvertedJWSymb[1] + 1].y,
        onComplete: () => this.onJWildConversionComplete(reelsView, animSymbols, convertedPositions),
      });
    });
  }

  protected onJWildConversionComplete(
    reelsView: any,
    animSymbols: ReelSymbolSprite[],
    convertedPositions: [number, number][],
  ): void {
    this.pendingJwdAnimations--;

    if (this.pendingJwdAnimations === 0) {
      animSymbols.forEach((symb) => {
        this.symbolsContainer.removeChild(symb);
        symb.destroy();
      });

      convertedPositions.forEach(([reelIndex, rowIndex]) => {
        const symbol = this.symbolsArray?.[reelIndex]?.[rowIndex + 1];
        const nextSymbol = reelsView?.[reelIndex]?.[rowIndex];
        if (!symbol || !nextSymbol) return;
        symbol.visible = true;
        symbol.swapSymbolTexture(nextSymbol);
      });
      StateManager.doNextStep();
    }
  }
}
