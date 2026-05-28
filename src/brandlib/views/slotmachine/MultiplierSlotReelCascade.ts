import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import SlotReelCascade from '@core/views/slotmachine/SlotReelCascade';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { CascadeReelWinTicker } from '../comps/CascadeReelWinTicker';
import { GameProxy } from '@core/models/GameConfigProxy';
import { FsTotalMultiplierComp } from '../comps/FsTotalMultiplierComp';
import { Back } from 'gsap/gsap-core';

/*****************************************************************************************************************
data.symbMultipliers // to check if have different assets for different multiplier values (ex: EOG both versions).
data.hasFSTotalMultiplier // to check if game has a concept of total multiplier during fs (ex: EOG both versions).
******************************************************************************************************************/
export default class MultiplierSlotReelCascade extends SlotReelCascade {
  private cascadeReelWinTicker: CascadeReelWinTicker;
  private fsTotalMultiComp: FsTotalMultiplierComp;
  private multiplierTextArr: PixText[];
  private multiplierAnimCount: number = 0;
  private totalMultiplierCount: number = 0;
  private isFallingIn: boolean = false;
  constructor(configData: any) {
    super(configData);
    this.multiplierTextArr = [];
    this.cascadeReelWinTicker = this.elementsList['reelWinTicker'];
    this.fsTotalMultiComp = this.elementsList['fsTotalMultiComp'];
    EventHandler.addEventListener(SlotEvents.COLLECT_MULTIPLIER, this.showMultiplierCollection.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.resetSlotReelVal.bind(this));

    if (this.configData.data.hasFSTotalMultiplier) {
      this.cascadeReelWinTicker.on(SlotEvents.UPDATE_TOTAL_MULTIPLIER, this.onUpdateFsTotalMulti.bind(this));
    }
  }
  public restartIdleAnim(): void {
    this.showIdleAnim(true);
  }
  protected startSpin(): void {
    this.isFallingIn = false;
    super.startSpin();
  }
  protected renderUnfinishedReel(): void {
    if (appModel.isCascadeGame()) {
      const reelsview = appModel.getUnfinishedCascadeReel();
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        if (this.reelsData.isFixedSymbol) {
          for (let j = 0; j < this.reelsData.noOfRows; j++) {
            const isBonusSymbol = reelsview[k][j]?.includes('BN');
            if (isBonusSymbol) {
              const multiplierVal = appModel.getSymbMultiplierValue(k, j);
              const currentSymb = this.symbolsArray[k][j] as CascadeReelSymbol;
              currentSymb.setRewardData(multiplierVal);
              if (this.reelsData.symbMultipliers) {
                const multiplierSymb = this.getCorrespondingMultiplierSymbol(
                  multiplierVal,
                  this.reelsData.symbMultipliers,
                );
                this.symbolsArray[k][j].setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
              } else {
                this.symbolsArray[k][j].setNewSymbol(this.reelsData.symbolsData[reelsview[k][j]], k);
              }
            } else {
              this.symbolsArray[k][j].setNewSymbol(this.reelsData.symbolsData[reelsview[k][j]], k);
            }
          }
        } else {
          for (let j = 1; j <= this.reelsData.noOfRows; j++) {
            this.symbolsArray[k][j].setNewSymbol(this.reelsData.symbolsData[reelsview[k][j - 1]], k);
          }
        }
      }
      this.showIdleAnim(false);
    } else {
      const reelsview = appModel.getUnfinishedReel();
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        for (let j = 1; j <= this.reelsData.noOfRows; j++) {
          const symb = reelsview[k][j - 1];
          this.symbolsArray[k][j].setNewSymbol(this.reelsData.symbolsData[reelsview[k][j - 1]], k);
        }
      }
    }

    this.showIdleAnim(false);
  }
  protected stopSpinQuick(): void {
    this.quickSpinStarted = true;
    this.isStopSpinButtonClick = false;
    // clear any existing timeouts to avoid calls to getNewSymbolsIn which is sored with an timeout
    if (this.timeoutIds[0]) {
      clearTimeout(this.timeoutIds[0]);
      this.timeoutIds[0] = null;
    }
    EventHandler.dispatchEvent(SlotEvents.DISABLE_STOPSPIN_BUTTON);
    let index = 0;
    let rowIndex = 0;
    let symb;
    const ENTER_DISTANCE = this.configData.data.reelHeight + this.configData.data.symbolHeight;

    const reelsView = appModel.getCascadeReelsView();
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      index = k * 0.2;
      rowIndex = 0;
      for (let i = 0; i < this.reelsData.noOfRows; i++) {
        symb = this.symbolsArray[k][i] as CascadeReelSymbol;
        symb.setNormalTexture();
        const isBonusSymbol = reelsView[k][i]?.includes('BN');
        if (isBonusSymbol) {
          const multiplierVal = appModel.getSymbMultiplierValue(k, i);
          const currentSymb = this.symbolsArray[k][i] as CascadeReelSymbol;
          currentSymb.setRewardData(multiplierVal);
          if (this.reelsData.symbMultipliers) {
            const multiplierSymb = this.getCorrespondingMultiplierSymbol(multiplierVal, this.reelsData.symbMultipliers);
            symb.setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
          } else {
            symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
          }
        } else {
          symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
        }
        this.symbolsContainer.addChild(symb);
        //symb.y = -(this.reelsData.noOfRows - i) * this.reelsData.symbolHeight * 2;
      }
    }
    this.symbolFallingIndex = 0;
    let finalY;

    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32;
    for (let k = 0; k < this.configData.data.noOfReels; k++) {
      index = k * 0.2;
      rowIndex = 0;

      for (let i = this.configData.data.noOfRows - 1; i >= 0; i--) {
        finalY = i * this.configData.data.symbolHeight;
        const delay = 0; //k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
        if (!this.isFallingIn) {
          this.symbolsArray[k][i].y = finalY - ENTER_DISTANCE;
        }

        AnimationProxy.animateTween(this.symbolsArray[k][i], {
          duration: ENTER_DURATION / 2,
          delay,
          y: finalY,
          ease: Back.easeOut.config(0.6),
          onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
        });
      }
    }
  }

  protected getNewSymbolsIn(): void {
    this.isStopSpinButtonClick = false;
    this.isFallingIn = true;
    let index = 0;
    let rowIndex = 0;
    let symb;
    const ENTER_DISTANCE = this.configData.data.reelHeight + this.configData.data.symbolHeight;

    const reelsView = appModel.getCascadeReelsView();
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      index = k * 0.2;
      rowIndex = 0;
      for (let i = 0; i < this.reelsData.noOfRows; i++) {
        symb = this.symbolsArray[k][i] as CascadeReelSymbol;
        symb.setNormalTexture();
        const isBonusSymbol = reelsView[k][i]?.includes('BN');
        if (isBonusSymbol) {
          const multiplierVal = appModel.getSymbMultiplierValue(k, i);
          const currentSymb = this.symbolsArray[k][i] as CascadeReelSymbol;
          currentSymb.setRewardData(multiplierVal);
          if (this.reelsData.symbMultipliers) {
            const multiplierSymb = this.getCorrespondingMultiplierSymbol(multiplierVal, this.reelsData.symbMultipliers);
            symb.setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
          } else {
            symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
          }
        } else {
          symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
        }
        this.symbolsContainer.addChild(symb);
        symb.y = -(this.reelsData.noOfRows - i) * this.reelsData.symbolHeight * 2;
      }
    }
    this.symbolFallingIndex = 0;
    let finalY;

    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32;
    for (let k = 0; k < this.configData.data.noOfReels; k++) {
      index = k * 0.2;
      rowIndex = 0;

      for (let i = this.configData.data.noOfRows - 1; i >= 0; i--) {
        finalY = i * this.configData.data.symbolHeight;
        const delay = k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
        this.symbolsArray[k][i].y = finalY - ENTER_DISTANCE;
        if (appModel.turboMode) {
          const tween = AnimationProxy.animateTween(this.symbolsArray[k][i], {
            duration: ENTER_DURATION / 2,
            delay,
            y: finalY,
            ease: Back.easeOut.config(0.6),
            onUpdate: () => {
              this.checkForSymbolDistanceCovered(this.symbolsArray[k][i], tween);
            },
            onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
          });
        } else {
          const tween = AnimationProxy.animateTween(this.symbolsArray[k][i], {
            duration: ENTER_DURATION,
            delay,
            y: finalY,
            ease: Back.easeOut.config(0.6),
            onUpdate: () => {
              this.checkForSymbolDistanceCovered(this.symbolsArray[k][i], tween);
            },
            onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
          });
        }
      }
    }
    EventHandler.dispatchEvent(SlotEvents.PLAY_CASCADE_NEW_SYMBOLS_IN_SOUND);
  }

  protected showNewSymbolsCascadeIn() {
    const len1 = this.newExploadedSymbolIndexes.length;
    this.totalNewSymbolsToCascade = 0;
    this.newSymbolCascadeIndex = 0;
    const reelsView = appModel.getCascadeReelsView();
    let finalY;

    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32;
    for (let k = 0; k < len1; k++) {
      this.newExploadedSymbolIndexes[k].sort();
      const len = this.newExploadedSymbolIndexes[k].length;
      for (let i = 0; i < len; i++) {
        const ENTER_DISTANCE = (len - i) * this.configData.data.symbolHeight + this.configData.data.symbolHeight * 0.5;
        this.totalNewSymbolsToCascade++;
        if (this.symbolsArray[k][i]) {
          this.symbolsArray[k][i].resetScale();
          this.symbolsArray[k][i].setNormalTexture();
          const isBonusSymbol = reelsView[k][i]?.includes('BN');
          if (isBonusSymbol) {
            const multiplierVal = appModel.getSymbMultiplierValue(k, i);
            const currentSymb = this.symbolsArray[k][i] as CascadeReelSymbol;
            currentSymb.setRewardData(multiplierVal);
            if (this.reelsData.symbMultipliers) {
              const multiplierSymb = this.getCorrespondingMultiplierSymbol(
                multiplierVal,
                this.reelsData.symbMultipliers,
              );
              currentSymb.setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
            } else {
              currentSymb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
            }
          } else {
            this.symbolsArray[k][i].setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
          }

          finalY = i * this.configData.data.symbolHeight;
          const delay = k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
          this.symbolsArray[k][i].y = 0 - ENTER_DISTANCE;
          if (appModel.turboMode) {
            const tween = AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: ENTER_DURATION / 2,
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onUpdate: () => {
                this.checkForSymbolDistanceCovered(this.symbolsArray[k][i], tween);
              },
              onComplete: this.onVallCCNewSymbolFinalStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          } else {
            const tween = AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: ENTER_DURATION,
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onUpdate: () => {
                this.checkForSymbolDistanceCovered(this.symbolsArray[k][i], tween);
              },
              onComplete: this.onVallCCNewSymbolFinalStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          }
        } else {
          this.newSymbolCascadeIndex++;
        }
      }
    }
    EventHandler.dispatchEvent(SlotEvents.PLAY_CASCADE_NEW_SYMBOLS_AFTER_TUMBLE_IN_SOUND);
  }

  protected showMultiplierCollection(): void {
    if (appModel.getIsFreeSpinsSession()) {
      if (this.configData.data.hasFSTotalMultiplier) {
        this.createFsTotalMultiplier();
      } else {
        this.cascadeReelWinTicker.setupForAnimation();
        this.createMultipliersToAnimate();
      }
    } else {
      this.cascadeReelWinTicker.setupForAnimation();
      this.createMultipliersToAnimate();
    }
  }

  protected createFsTotalMultiplier() {
    const totalMultValue = this.fsTotalMultiComp.getCurrentTotalMultiplierVal();
    if (totalMultValue) {
      const totalMultiText = UIUtil.getElement(this.configData.data.multiplierTextConfig);
      const totalMultiComp = this.fsTotalMultiComp.getTotalMultiTextComp();
      totalMultiText.style.fontSize = totalMultiComp.style.fontSize;
      const multiplierPos = GameProxy.config.FsTotalMultiplierComp.toGlobal(this);
      const multiplierPosLocal = this.toLocal(multiplierPos);
      totalMultiText.text = `${totalMultValue}x`;
      totalMultiText.x = multiplierPosLocal.x - this.x;
      totalMultiText.y = multiplierPosLocal.y - this.y;
      this.addChild(totalMultiText);
      this.cascadeReelWinTicker.setupForAnimation();
      this.animateFsTotalMultiplier(totalMultiText);
    } else {
      this.cascadeReelWinTicker.setupForAnimation();
      this.createMultipliersToAnimate();
    }
  }

  protected createMultipliersToAnimate() {
    const multiplierPos = appModel.getMultiplierPositionData();
    this.totalMultiplierCount = multiplierPos.length;
    this.createMultiplierAt(0); // passing "0" here since in case of multiple multiplier in same cascade then while animating if create all at once then jerk was showing. hence create the first then once it moves completely then create the other and animate.
    this.animateMultiplier();
  }

  protected createMultiplierAt(index: number) {
    const multiplierPos = appModel.getMultiplierPositionData();
    const data = multiplierPos[index];
    const pos = {
      reel: data.position[0],
      row: this.reelsData.isFixedSymbol ? data.position[1] : data.position[1] + 1,
    };
    const symb = this.symbolsArray[pos.reel][pos.row] as CascadeReelSymbol;
    symb.clearRewardData();
    const textElemet = symb.getTextElement();
    const multiText = UIUtil.getElement(this.configData.data.multiplierTextConfig);
    multiText.text = `${data.multiplier}x`;
    multiText.style.fontSize = textElemet.style.fontSize * symb.scale.x;
    multiText.x = this.symbolsContainer.x + symb.x;
    multiText.y = this.symbolsContainer.y + symb.y;
    this.addChild(multiText);
    this.multiplierTextArr[index] = multiText;
  }

  protected animateFsTotalMultiplier(totalMultiText: PixText) {
    const multiplierPos = GameProxy.config.reelWintickerMultiplier.toGlobal(this);
    const multiplierPosLocal = this.toLocal(multiplierPos);
    const duration = appModel.turboMode ? 0.4 : 0.6;
    AnimationProxy.animateTween(totalMultiText, {
      x: multiplierPosLocal.x - this.x,
      y: multiplierPosLocal.y - this.y,
      duration: duration,
      ease: 'Linear.easeOut',
      onComplete: this.fsTotalMultiplierWentUp.bind(this, totalMultiText),
    });
    EventHandler.dispatchEvent(SlotEvents.PLAY_MULTIPLIER_TRAILING_SOUND);
  }

  protected animateMultiplier() {
    const multiplierPos = GameProxy.config.reelWintickerMultiplier.toGlobal(this);
    const multiplierPosLocal = this.toLocal(multiplierPos);
    const multiText = this.multiplierTextArr[this.multiplierAnimCount];
    const duration = appModel.turboMode ? 0.4 : 0.6;
    AnimationProxy.animateTween(multiText, {
      x: multiplierPosLocal.x - this.x,
      y: multiplierPosLocal.y - this.y,
      duration: duration,
      ease: 'Linear.easeOut',
      onComplete: this.onMultiplierWentUp.bind(this),
    });
    EventHandler.dispatchEvent(SlotEvents.PLAY_MULTIPLIER_TRAILING_SOUND);
  }

  protected onMultiplierWentUp() {
    const multiplierPos = appModel.getMultiplierPositionData();
    this.removeChild(this.multiplierTextArr[this.multiplierAnimCount]);
    this.cascadeReelWinTicker.updateMultiplier(multiplierPos[this.multiplierAnimCount].multiplier);
    this.multiplierAnimCount++;
    if (this.multiplierAnimCount < this.totalMultiplierCount) {
      this.createMultiplierAt(this.multiplierAnimCount);
      this.animateMultiplier();
    } else {
      this.cascadeReelWinTicker.animateToShowTotalWin();
    }
  }

  protected fsTotalMultiplierWentUp(totalMultiText: PixText) {
    this.removeChild(totalMultiText);
    totalMultiText.destroy();
    this.cascadeReelWinTicker.updateMultiplier(this.fsTotalMultiComp.getCurrentTotalMultiplierVal());
    this.createMultipliersToAnimate();
  }

  protected onUpdateFsTotalMulti() {
    this.fsTotalMultiComp?.updateMultiplier();
  }

  protected resetSlotReelVal() {
    this.multiplierAnimCount = 0;
    this.totalMultiplierCount = 0;
    this.multiplierTextArr.forEach((elem) => {
      elem.destroy();
    });
    this.multiplierTextArr = [];
  }

  //overriding these methods to pass multiplierTextConfig to symbols in cascade
  protected getRandomSymbol(reelno: number) {
    const symbols = this.reelsData.reelsConfig.maingame[reelno];
    const symbol = symbols[Util.getRandomRange(0, symbols.length - 1)];
    const data: any = {
      ...this.reelsData.symbolsData[symbol],
      reelNumber: reelno,
      multiplierTextConfig: this.reelsData.multiplierTextConfig,
    };
    return new this.reelsData.symbolClass({ data });
  }

  protected getNextSymbol(reelno: number) {
    const symbol = this.getNextSymbolName(reelno);
    const data: any = {
      ...this.reelsData.symbolsData[symbol],
      reelNumber: reelno,
      multiplierTextConfig: this.reelsData.multiplierTextConfig,
    };
    return new this.reelsData.symbolClass({ data });
  }

  protected getFirstTimeSymbol(reelno: number, rowIndex: number) {
    if (rowIndex == 0 || rowIndex == this.reelsData.noOfRows + 1) {
      return this.getNextSymbol(reelno);
    }
    const symbol = this.reelsData.initialReel[reelno][rowIndex - 1];
    const data: any = {
      ...this.reelsData.symbolsData[symbol],
      reelNumber: reelno,
      multiplierTextConfig: this.reelsData.multiplierTextConfig,
    };
    return new this.reelsData.symbolClass({ data });
  }
  //-------------------------------

  protected getCorrespondingMultiplierSymbol(multiplierVal: number, symbMultipliers: Record<string, number[]>): string {
    for (const key in symbMultipliers) {
      if (symbMultipliers[key].includes(multiplierVal)) {
        return key;
      }
    }
    return Object.keys(symbMultipliers)[0];
  }
}
