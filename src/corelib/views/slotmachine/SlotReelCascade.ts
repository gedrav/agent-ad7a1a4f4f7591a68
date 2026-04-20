import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import SlotReel from '@core/views/slotmachine/SlotReel';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { Back, Cubic, Elastic, Strong } from 'gsap/gsap-core';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { StateManager } from '@core/states/StateManagerService';
import ReelSymbol from '@core/views/slotmachine/ReelSymbol';
import { STATES } from '@core/states/StateConstants';
import { Power3, Power1, Sine } from 'gsap/gsap-core';

type BlastSymbol = {
  reelIndex: number;
  rowIndex: number;
  symbol: ReelSymbolSprite;
  initialScaleX: number;
  initialScaleY: number;
};

export default class SlotReelCascade extends SlotReel {
  protected fallingOutDuration = 0.32;
  protected fallingInDuration = 0.32;
  protected fallingCounter = 0;
  protected totalBlasts = 0;
  protected blastIndex = 0;
  protected fallRotation = 5;
  protected totalNewSymbolsToCascade = 0;
  protected newSymbolCascadeIndex = 0;
  protected symbEase = Cubic.easeIn;
  protected symbolFallingIndex = 0;
  protected moveArray: Array<Array<number>>;
  protected newExploadedSymbolIndexes: Array<Array<number>>;
  protected totalCascades = 0;
  protected cascadeIndex = 0;
  protected freeSpinSession = false;
  protected allSymbolsFallen = false;
  protected spinResponseReceived = false;
  protected isStopSpinButtonClick: boolean = false;
  protected timeoutIds: any[] = [];
  protected explodedSymbolsIndexes: any[];
  protected totalSymbols: number;

  constructor(configData: any) {
    super(configData);
    this.timeoutIds = [];
    this.totalSymbols = this.reelsData.noOfReels * this.reelsData.noOfRows;
    EventHandler.addEventListener(SlotEvents.BLAST_SYMBOLS, this.showBlastAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.CASCADE_SYMBOLS, this.showNewSymbolsCascadeIn.bind(this));
  }

  protected startSpin(): void {
    this.setSymbolsClickable(false);
    this.showIdleAnim(false);
    this.resetSpinParams();
    this.hidePayout();
    this.isStopSpinButtonClick = false;
    this.quickSpinStarted = false;
    this.fallingCounter = 0;
    this.explodedSymbolsIndexes = [];
    let arr: Array<any>;
    for (let k = 0; k < this.configData.data.noOfReels; k++) {
      arr = [];
      this.explodedSymbolsIndexes.push(arr);
    }
    this.allSymbolsFallen = false;
    this.spinResponseReceived = false;
    this.fallSymbolsOut();
  }
  protected startStoppingSpin(): void {
    if (this.quickSpinStarted) {
      return;
    }
    this.spinResponseReceived = true;
    if (appModel.turboMode) {
      this.stopSpinQuick();
      return;
    }
    this.checkToGetNewSymbols();
  }

  protected stopSpinQuick(): void {
    this.quickSpinStarted = true;

    if (this.isStopSpinButtonClick) {
      this.isStopSpinButtonClick = false;
      EventHandler.dispatchEvent(SlotEvents.DISABLE_STOPSPIN_BUTTON);
      let symb: ReelSymbol;
      const reelsview = appModel.getCascadeReelsView();
      for (let k = 0; k < this.configData.data.noOfReels; k++) {
        for (let i = 0; i < this.configData.data.noOfRows; i++) {
          symb = this.symbolsArray[k][i];
          symb.swapSymbolTexture(reelsview[k][i], k);
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

  protected fallSymbolsOut(): void {
    const len = this.symbolsArray.length;
    let index = 0;
    let rowIndex = 0;

    const COL_STAGGER = 0.06;
    const EXIT_DISTANCE = this.configData.data.reelHeight + this.configData.data.symbolHeight;
    const EXIT_DURATION = 0.44;

    for (let k = 0; k < len; k++) {
      const len2 = this.symbolsArray[k].length;
      index = k * 0.1;
      rowIndex = 0;
      for (let i = len2 - 1; i >= 0; i--) {
        if (appModel.turboMode) {
          const symbol = this.symbolsArray[k][i];
          const startY = symbol.y;
          const targetY = startY + EXIT_DISTANCE;
          const delay = k * COL_STAGGER;

          AnimationProxy.animateTween(symbol, {
            duration: EXIT_DURATION / 2,
            delay,
            y: targetY,
            ease: Power1.easeIn, // GSAP 2 style
            onComplete: this.onSymbolReachedEnd.bind(this, symbol),
          });
        } else {
          const symbol = this.symbolsArray[k][i];
          const startY = symbol.y;
          const targetY = startY + EXIT_DISTANCE;
          const delay = k * COL_STAGGER;

          AnimationProxy.animateTween(symbol, {
            duration: EXIT_DURATION,
            delay,
            y: targetY,
            ease: Power1.easeIn, // GSAP 2 style
            onComplete: this.onSymbolReachedEnd.bind(this, symbol),
          });
        }
      }
    }
  }
  protected onSymbolReachedEnd(symb: any): void {
    this.fallingCounter++;
    if (this.fallingCounter == this.totalSymbols) {
      this.allSymbolsFallen = true;
      this.checkToGetNewSymbols();
    }
  }
  protected checkToGetNewSymbols(): void {
    if (this.allSymbolsFallen && this.spinResponseReceived) {
      if (appModel.turboMode) {
        this.timeoutIds[0] = setTimeout(this.getNewSymbolsIn.bind(this), 0);
      } else {
        this.timeoutIds[0] = setTimeout(this.getNewSymbolsIn.bind(this), 100);
      }
    }
  }
  protected getNewSymbolsIn(): void {
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
            duration: this.fallingInDuration / 2,
            delay: delay,
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
  protected onSymbolCameIn(symb: ReelSymbol): void {
    symb.showLanding();
    if (this.reelsData.landingSymbols.includes(symb.getSymbolName())) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_LANDING_SOUND, symb.getSymbolName());
    }
    this.onSymbolFinallySettled(symb);
  }

  protected onSymbolFinallySettled(symb: ReelSymbol): void {
    this.symbolFallingIndex++;
    if (this.symbolFallingIndex == this.totalSymbols) {
      StateManager.doNextStep();
    }
  }
  protected showBlastAnim(): void {
    this.explodedSymbolsIndexes = [];
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      const arr: any[] = [];
      this.explodedSymbolsIndexes.push(arr);
    }
    const tumbleData = appModel.getSpinBlastData();
    const blastPositions = Util.combineBlastPoisitions(tumbleData);
    const len = blastPositions.length;
    this.totalBlasts = len;
    this.blastIndex = 0;
    if (len > 0) {
      EventHandler.dispatchEvent('PLAY_SYMBOL_DISAPPEAR_SOUND');
      for (let k = 0; k < len; k++) {
        const arr: Array<number> = blastPositions[k];
        this.showSymbolBlast(this.symbolsArray[arr[0]][arr[1]], k * 50);
        if (this.explodedSymbolsIndexes[arr[0]].indexOf(arr[1]) <= -1) {
          this.explodedSymbolsIndexes[arr[0]].push(arr[1]);
        }
      }
    }
  }
  protected showSymbolBlast(symbol: ReelSymbolSprite, delay: number = 0): void {
    EventHandler.dispatchEvent(SlotEvents.PLAY_TUMBLE_BLAST_SOUND);
    symbol.showBlastAnim(() => this.onBlastAnimComplete(symbol));
  }
  protected onBlastAnimComplete(symbol: ReelSymbolSprite): void {
    this.blastIndex++;
    if (this.blastIndex == this.totalBlasts) {
      this.enterCascadeExistingSymbols();
    }
  }
  protected enterCascadeExistingSymbols(): void {
    this.moveArray = [];
    for (let p = 0; p < this.reelsData.noOfReels; p++) {
      const marr = [0, 0, 0, 0, 0];
      this.moveArray.push(marr);
    }
    let len = this.explodedSymbolsIndexes.length;
    for (let k = 0; k < len; k++) {
      this.explodedSymbolsIndexes[k].sort();
    }

    len = this.explodedSymbolsIndexes.length;
    for (let k = 0; k < len; k++) {
      const len2 = this.explodedSymbolsIndexes[k].length;
      for (let j = 0; j < len2; j++) {
        if (this.explodedSymbolsIndexes[k][j] > 0) {
          for (let i = 0; i < this.explodedSymbolsIndexes[k][j]; i++) {
            if (this.explodedSymbolsIndexes[k].indexOf(i) == -1) {
              this.moveArray[k][i]++;
            }
          }
        }
      }
    }
    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32 / 5;
    len = this.moveArray.length;
    this.totalCascades = 0;
    this.cascadeIndex = 0;
    for (let k = 0; k < len; k++) {
      const len2 = this.moveArray[k].length;
      for (let i = 0; i < len2; i++) {
        if (this.moveArray[k][i] > 0) {
          this.totalCascades++;
          const delay = k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
          const timeVal = (this.fallingInDuration / 2 + delay - 0.5) * 1000;
          const finalY = this.symbolsArray[k][i].y + this.moveArray[k][i] * this.configData.data.symbolHeight;

          if (appModel.turboMode) {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: (ENTER_DURATION / 2) * this.moveArray[k][i],
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onComplete: this.onCascadeFallStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          } else {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: ENTER_DURATION * this.moveArray[k][i],
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onComplete: this.onCascadeFallStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          }
        }
      }
    }
    if (this.totalCascades == 0) {
      const len1 = this.explodedSymbolsIndexes.length;
      if (len1 > 0) {
        this.newExploadedSymbolIndexes = [];
        for (let k = 0; k < len1; k++) {
          this.newExploadedSymbolIndexes[k] = [];
          const len = this.explodedSymbolsIndexes[k].length;
          for (let i = len - 1; i >= 0; i--) {
            const symb = this.symbolsArray[k][this.explodedSymbolsIndexes[k][i]];
            this.symbolsArray[k].splice(this.explodedSymbolsIndexes[k][i], 1);
            this.symbolsArray[k].unshift(symb);
            this.newExploadedSymbolIndexes[k].push(i);
          }
        }
      }

      this.cascadeIndex = -1;
    }
    EventHandler.dispatchEvent(SlotEvents.PLAY_CASCADE_NEW_SYMBOLS_AFTER_TUMBLE_IN_SOUND);
    this.getNewExploadedSymbolIndexes();
    this.allBlastsCompleted();
  }

  protected onCascadeFallStepComplete(symb: ReelSymbolSprite): void {
    symb.showLanding();
  }

  protected getNewExploadedSymbolIndexes(): void {
    this.newExploadedSymbolIndexes = [];
    const tempSymbols: Array<Array<ReelSymbolSprite>> = [];
    const outerlen = this.explodedSymbolsIndexes.length;
    for (let k = 0; k < outerlen; k++) {
      this.newExploadedSymbolIndexes[k] = [];
      tempSymbols[k] = [];
      const len = this.explodedSymbolsIndexes[k].length;
      for (let i = len - 1; i >= 0; i--) {
        const symb = this.symbolsArray[k][this.explodedSymbolsIndexes[k][i]];
        tempSymbols[k].push(symb);
        this.symbolsArray[k].splice(this.explodedSymbolsIndexes[k][i], 1);
        this.newExploadedSymbolIndexes[k].push(i);
      }
      const len2 = tempSymbols[k].length;
      if (len2 > 0) {
        for (let i = 0; i < len2; i++) {
          this.symbolsArray[k].unshift(tempSymbols[k][i]);
        }
      }
    }
  }

  protected allBlastsCompleted(): void {
    StateManager.next();
  }

  protected showNewSymbolsCascadeIn() {
    const len1 = this.newExploadedSymbolIndexes.length;
    this.totalNewSymbolsToCascade = 0;
    this.newSymbolCascadeIndex = 0;
    const reelsView = appModel.getCascadeReelsView();

    const COL_STAGGER = 0.1;
    const ROW_STAGGER = 0.05;
    const ENTER_DURATION = 0.32 / 5;

    for (let k = 0; k < len1; k++) {
      this.newExploadedSymbolIndexes[k].sort();
      const len = this.newExploadedSymbolIndexes[k].length;
      for (let i = 0; i < len; i++) {
        this.totalNewSymbolsToCascade++;
        const delay = k * COL_STAGGER + (this.configData.data.noOfRows - i) * ROW_STAGGER;
        if (this.symbolsArray[k][i]) {
          this.symbolsArray[k][i].resetScale();
          this.symbolsArray[k][i].setNormalTexture();
          this.symbolsArray[k][i].setNewSymbol(this.reelsData.symbolsData[reelsView[k][i]], k);
          this.symbolsArray[k][i].y = -(len - i + 1) * this.configData.data.symbolHeight;
          const finalY = i * this.configData.data.symbolHeight;
          console.log('here == ', i, finalY - this.symbolsArray[k][i].y);
          if (appModel.turboMode) {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: (ENTER_DURATION / 2) * this.moveArray[k][i],
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onComplete: this.onVallCCNewSymbolFinalStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          } else {
            AnimationProxy.animateTween(this.symbolsArray[k][i], {
              duration: ENTER_DURATION * this.moveArray[k][i],
              delay,
              y: finalY,
              ease: Back.easeOut.config(0.6),
              onComplete: this.onVallCCNewSymbolFinalStepComplete.bind(this, this.symbolsArray[k][i]),
            });
          }
        } else {
          this.newSymbolCascadeIndex++;
        }
      }
    }
  }

  protected onVallCCNewSymbolFinalStepComplete(symb: ReelSymbolSprite): void {
    this.newSymbolCascadeIndex++;
    if (this.reelsData.landingSymbols.includes(symb.getSymbolName())) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_LANDING_SOUND, symb.getSymbolName());
    }
    if (this.newSymbolCascadeIndex == this.totalNewSymbolsToCascade) {
      StateManager.goToState(STATES.SHOW_TUMBLE_WIN_STATE);
    }
  }
}
