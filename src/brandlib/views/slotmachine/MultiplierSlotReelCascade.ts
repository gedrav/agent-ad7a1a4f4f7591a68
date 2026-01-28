import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import RewardSymbol from '@brand/views/slot/RewardSymbol';
import SlotReelCascade from '@core/views/slotmachine/SlotReelCascade';

export default class MultiplierSlotReelCascade extends SlotReelCascade {
  constructor(configData: any) {
    super(configData);
  }

  protected stopSpinQuick(): void {
    this.quickSpinStarted = true;

    if (this.isStopSpinButtonClick) {
      this.isStopSpinButtonClick = false;
      EventHandler.dispatchEvent(SlotEvents.DISABLE_STOPSPIN_BUTTON);
      let symb: RewardSymbol;
      const reelsview = appModel.getCascadeReelsView();
      for (let k = 0; k < this.configData.data.noOfReels; k++) {
        for (let i = 0; i < this.configData.data.noOfRows; i++) {
          symb = this.symbolsArray[k][i] as RewardSymbol;
          symb.setNormalTexture();
          symb.swapSymbolTexture(reelsview[k][i]);
          const isBonusSymbol = this.reelsData.symbolsData[reelsview[k][i]]?.isBonusSymbol;
          if (isBonusSymbol) {
            const multiplierVal = appModel.getSymbMultiplierValue(k, i);
            const currentSymb = this.symbolsArray[k][i] as RewardSymbol;
            currentSymb.setRewardData(multiplierVal);
          }
          this.symbolsContainer.addChild(symb);
          symb.x = this.configData.data.reelPositionX[k];
          symb.y = -(this.configData.data.noOfRows - i) * this.configData.data.symbolHeight * 2;
        }
      }
      this.symbolFallingIndex = 0;
      let finalY: number, delay: number;
      for (let k = 0; k < this.configData.data.noOfReels; k++) {
        for (let i = this.configData.data.noOfRows - 1; i >= 0; i--) {
          finalY = i * this.configData.data.symbolHeight;
          delay = 0.1;
          AnimationProxy.animateTween(
            this.symbolsArray[k][i],
            {
              duration: this.fallingInDuration / 4,
              delay: delay,
              y: finalY,
              ease: this.symbEase,
              onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
            },
            true,
          );
        }
      }
    }
  }

  protected getNewSymbolsIn(): void {
    if (this.isStopSpinButtonClick) {
      this.isStopSpinButtonClick = false;
      EventHandler.dispatchEvent(SlotEvents.DISABLE_STOPSPIN_BUTTON);
      let index = 0;
      let rowIndex = 0;
      let symb;
      const reelsView = appModel.getCascadeReelsView();
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        index = k * 0.2;
        rowIndex = 0;
        for (let i = 0; i < this.reelsData.noOfRows; i++) {
          symb = this.symbolsArray[k][i];
          symb.setNormalTexture();
          const isBonusSymbol = this.reelsData.symbolsData[reelsView[k][i]]?.isBonusSymbol;
          if (isBonusSymbol) {
            const multiplierVal = appModel.getSymbMultiplierValue(k, i);
            const currentSymb = this.symbolsArray[k][i] as RewardSymbol;
            currentSymb.setRewardData(multiplierVal);
          }
          symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]]);
          this.symbolsContainer.addChild(symb);
          symb.y = -(this.reelsData.noOfRows - i) * this.reelsData.symbolHeight * 2;
        }
      }
      this.symbolFallingIndex = 0;
      let finalY, delay, timeVal;
      for (let k = 0; k < this.configData.data.noOfReels; k++) {
        index = k * 0.2;
        rowIndex = 0;
        for (let i = this.configData.data.noOfRows - 1; i >= 0; i--) {
          finalY = i * this.configData.data.symbolHeight;
          delay = index + rowIndex++ * 0.05;
          timeVal = (this.fallingInDuration + delay - 0.8) * 500;
          if (appModel.turboMode) {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: this.fallingInDuration,
              delay: delay * 0.15,
              y: finalY,
              ease: this.symbEase,
              onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
            });
          } else {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: this.fallingInDuration,
              delay: delay,
              y: finalY,
              ease: this.symbEase,
              onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
            });
          }
        }
      }
    }
  }

  protected showNewSymbolsCascadeIn() {
    const len1 = this.newExploadedSymbolIndexes.length;
    this.totalNewSymbolsToCascade = 0;
    this.newSymbolCascadeIndex = 0;
    const reelsView = appModel.getCascadeReelsView();
    for (let k = 0; k < len1; k++) {
      this.newExploadedSymbolIndexes[k].sort();
      const len = this.newExploadedSymbolIndexes[k].length;
      for (let i = 0; i < len; i++) {
        this.totalNewSymbolsToCascade++;
        if (this.symbolsArray[k][i]) {
          this.symbolsArray[k][i].resetScale();
          this.symbolsArray[k][i].setNormalTexture();
          this.symbolsArray[k][i].setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
          const isBonusSymbol = this.reelsData.symbolsData[reelsView[k][i]]?.isBonusSymbol;
          if (isBonusSymbol) {
            const multiplierVal = appModel.getSymbMultiplierValue(k, i);
            const currentSymb = this.symbolsArray[k][i] as RewardSymbol;
            currentSymb.setRewardData(multiplierVal);
          }
          this.symbolsArray[k][i].y = -(len - i + 1) * this.configData.data.symbolHeight;
          const delay = k * 0.06 + (len - i) * 0.05;
          if (appModel.turboMode) {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: this.fallingInDuration / 2,
              delay: delay * 0.25,
              y: i * this.configData.data.symbolHeight,
              ease: this.symbEase,
              onComplete: this.onFallCCNewSymbolStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          } else {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: this.fallingInDuration,
              delay: delay,
              y: i * this.configData.data.symbolHeight,
              ease: this.symbEase,
              onComplete: this.onFallCCNewSymbolStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          }
        } else {
          this.newSymbolCascadeIndex++;
        }
      }
    }
  }
}
