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
import { Power1, Power2, Back } from 'gsap/gsap-core';

export default class MultiplierSlotReelCascade extends SlotReelCascade {
  private cascadeReelWinTicker: CascadeReelWinTicker;
  private fsTotalMultiComp: FsTotalMultiplierComp;
  private multiplierTextArr: PixText[];
  private multiplierAnimCount: number = 0;
  private totalMultiplierCount: number = 0;
  constructor(configData: any) {
    super(configData);
    this.multiplierTextArr = [];
    this.cascadeReelWinTicker = this.elementsList['reelWinTicker'];
    this.fsTotalMultiComp = this.elementsList['fsTotalMultiComp'];
    EventHandler.addEventListener(SlotEvents.COLLECT_MULTIPLIER, this.showMultiplierCollection.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.resetSlotReelVal.bind(this));

    this.cascadeReelWinTicker.on(SlotEvents.UPDATE_TOTAL_MULTIPLIER, this.onUpdateFsTotalMulti.bind(this));
  }
  public restartIdleAnim(): void {
    this.showIdleAnim(true);
  }
  protected stopSpinQuick(): void {
    console.log('stop spin quick');
    this.quickSpinStarted = true;
    console.log('stop spin quick -- ', this.isStopSpinButtonClick);
    console.log('xxxxxxxxxxxxxxxxx');
    this.isStopSpinButtonClick = false;
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
          const multiplierSymb = this.getCorrespondingMultiplierSymbol(multiplierVal, this.reelsData.symbMultipliers);
          symb.setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
        } else {
          symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
        }
        this.symbolsContainer.addChild(symb);
        //symb.y = -(this.reelsData.noOfRows - i) * this.reelsData.symbolHeight * 2;
      }
    }
    this.symbolFallingIndex = 0;
    let finalY, delay, timeVal;

    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32;
    for (let k = 0; k < this.configData.data.noOfReels; k++) {
      index = k * 0.2;
      rowIndex = 0;

      for (let i = this.configData.data.noOfRows - 1; i >= 0; i--) {
        finalY = i * this.configData.data.symbolHeight;
        const delay = 0; //k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
        //this.symbolsArray[k][i].y = finalY - ENTER_DISTANCE;

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
    //EventHandler.dispatchEvent(SlotEvents.DISABLE_STOPSPIN_BUTTON);
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
          const multiplierSymb = this.getCorrespondingMultiplierSymbol(multiplierVal, this.reelsData.symbMultipliers);
          symb.setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
        } else {
          symb.setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
        }
        this.symbolsContainer.addChild(symb);
        symb.y = -(this.reelsData.noOfRows - i) * this.reelsData.symbolHeight * 2;
      }
    }
    this.symbolFallingIndex = 0;
    let finalY, delay, timeVal;

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
          AnimationProxy.animateTween(this.symbolsArray[k][i], {
            duration: ENTER_DURATION / 2,
            delay,
            y: finalY,
            ease: Back.easeOut.config(0.6),
            onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
          });
        } else {
          AnimationProxy.animateTween(this.symbolsArray[k][i], {
            duration: ENTER_DURATION,
            delay,
            y: finalY,
            ease: Back.easeOut.config(0.6),
            onComplete: this.onSymbolCameIn.bind(this, this.symbolsArray[k][i]),
          });
        }
      }
    }
  }

  protected showNewSymbolsCascadeIn() {
    const len1 = this.newExploadedSymbolIndexes.length;
    this.totalNewSymbolsToCascade = 0;
    this.newSymbolCascadeIndex = 0;
    const reelsView = appModel.getCascadeReelsView();
    const ENTER_DISTANCE = this.configData.data.reelHeight + this.configData.data.symbolHeight;
    let finalY, delay, timeVal;

    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32;
    for (let k = 0; k < len1; k++) {
      this.newExploadedSymbolIndexes[k].sort();
      const len = this.newExploadedSymbolIndexes[k].length;
      for (let i = 0; i < len; i++) {
        this.totalNewSymbolsToCascade++;
        if (this.symbolsArray[k][i]) {
          this.symbolsArray[k][i].resetScale();
          this.symbolsArray[k][i].setNormalTexture();
          const isBonusSymbol = reelsView[k][i]?.includes('BN');
          if (isBonusSymbol) {
            const multiplierVal = appModel.getSymbMultiplierValue(k, i);
            const currentSymb = this.symbolsArray[k][i] as CascadeReelSymbol;
            currentSymb.setRewardData(multiplierVal);
            const multiplierSymb = this.getCorrespondingMultiplierSymbol(multiplierVal, this.reelsData.symbMultipliers);
            currentSymb.setNewSymbol(this.reelsData.symbolsData[multiplierSymb], k);
          } else {
            this.symbolsArray[k][i].setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
          }

          finalY = i * this.configData.data.symbolHeight;
          const delay = k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
          this.symbolsArray[k][i].y = finalY - ENTER_DISTANCE;
          if (appModel.turboMode) {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: ENTER_DURATION / 2,
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onComplete: this.onFallCCNewSymbolStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          } else {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: ENTER_DURATION,
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onComplete: this.onFallCCNewSymbolStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          }
        } else {
          this.newSymbolCascadeIndex++;
        }
      }
    }
  }

  protected showMultiplierCollection(): void {
    if (appModel.getIsFreeSpinsSession()) {
      this.createFsTotalMultiplier();
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
    this.createMultiplierAt(0);
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
    AnimationProxy.animateTween(totalMultiText, {
      x: multiplierPosLocal.x - this.x,
      y: multiplierPosLocal.y - this.y,
      duration: 0.6,
      ease: 'Linear.easeOut',
      onComplete: this.fsTotalMultiplierWentUp.bind(this, totalMultiText),
    });
  }

  protected animateMultiplier() {
    const multiplierPos = GameProxy.config.reelWintickerMultiplier.toGlobal(this);
    const multiplierPosLocal = this.toLocal(multiplierPos);
    const multiText = this.multiplierTextArr[this.multiplierAnimCount];
    AnimationProxy.animateTween(multiText, {
      x: multiplierPosLocal.x - this.x,
      y: multiplierPosLocal.y - this.y,
      duration: 0.6,
      ease: 'Linear.easeOut',
      onComplete: this.onMultiplierWentUp.bind(this),
    });
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
    this.fsTotalMultiComp.updateMultiplier();
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

  protected getCorrespondingMultiplierSymbol(multiplierVal: number, symbMultipliers: Record<string, number[]>): string {
    for (const key in symbMultipliers) {
      if (symbMultipliers[key].includes(multiplierVal)) {
        return key;
      }
    }
    return Object.keys(symbMultipliers)[0];
  }
}
