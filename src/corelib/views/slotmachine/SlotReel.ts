import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { Point, Ticker } from 'pixi.js';
import WinController from '@core/views/slotmachine/WinController';
import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { Elastic } from 'gsap/gsap-core';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { UIUtil } from '@core/utils/UIUtilService';
import { AppEvents } from '@core/events/AppEvents';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';
import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';
import { PixSpine } from '@core/pixiwrapper/PixSpine';

const reelSpinStartGap = 100;
const customEase = Elastic.easeOut.config(1.4, 0.6);

export default class SlotReel extends ResponsiveChildrenView {
  protected scatterAnticipArray: number[][] = [];
  protected currentReel: number = 0;
  protected anticipationRunning = [];
  protected symbolPassedCounterArray = [];
  protected stopStarted = [];
  protected startAnticipationReel = [];
  protected reelsCompleted = [];
  protected totalSymbols: number;
  protected anticipationElementArray: PixSpine[] = [];
  protected anticipationContainer: PixView;

  protected symbolsArray: ReelSymbolSprite[][] = [];
  protected reelSpinningState: number[];
  protected spinStarted: boolean = false;
  protected spinningSpeed: number = 50;
  protected movingUpSpeed: number = 10;
  protected maxSpeed: number = 70;
  protected minSpeed: number = 70;
  protected reelStopGap: number = 200;
  protected maxUpY: number = -80;
  protected maxDownY: number = 80;
  protected jerkDuration: number = 0.3;
  protected numberOfStoppedReels: number = 0;
  protected finalSymbols: string[][] = [];
  protected idleAnimTimeoutId: any;

  protected symbolsContainer: PixView;
  protected winSymbolsContainer: PixView;
  protected reelsData: any;
  protected reelsIndexes: number[];
  protected maskRect: PixGraphics;
  protected ticker: Ticker;
  protected tickerHandler: (ticker: Ticker) => void;
  protected winController: WinController;
  protected quickSpinStarted: boolean;
  protected speedFactor: number;
  protected lineWinAmountComp: LineWinAmountComp;
  protected reelFrame: ReelFrameComp;
  protected symbolPayoutComp: SymbolPayoutComp;
  private currentPayoutSymbol: ReelSymbolSprite;
  private payoutTimeoutId: any;
  private readonly modalRect: PixGraphics;
  protected spinResponseReceived: boolean;
  protected defaultReel: any[];
  private stopIndex: number[];
  protected reelWinTicker: ReelWinTicker;
  private readonly tickerComp: ReelTickerComp;
  private readonly fsAutoCounterComp: FSAutoCounterComp;
  public slotGuideRect: PixGraphics;
  protected timeoutIds: any[];
  private timeoutIds2: any[];
  private landingSymbolsCount: any;

  constructor(configData: any) {
    super(configData);
    this.anticipationContainer = this.elementsList['anticipationContainer'];
    this.symbolsContainer = this.elementsList['symbolsContainer'];
    this.winSymbolsContainer = this.elementsList['winSymbolsContainer'];
    this.lineWinAmountComp = this.elementsList['lineWinAmountComp'];
    this.reelFrame = this.elementsList['reelFrame'];
    this.symbolPayoutComp = this.winSymbolsContainer.elementsList['symbolPayoutComp'];
    this.modalRect = this.elementsList['modalRect'];
    this.reelWinTicker = this.elementsList['reelWinTicker'];
    this.fsAutoCounterComp = this.elementsList['fsAutoCounterComp'];
    this.tickerComp = this.elementsList['tickerComp'];
    this.modalRect.alpha = 0;
    UIUtil.setClickable(this.modalRect, false);
    UIUtil.addInteraction(this.modalRect, this.hidePayout.bind(this));

    this.slotGuideRect = UIUtil.getRectangle(200, 200, 0xffff00);
    this.addChildAt(this.slotGuideRect, 0);
    this.slotGuideRect.alpha = 0;

    this.reelsData = this.configData.data;
    this.reelSpinningState = [];
    this.resetSpinParams();

    GameProxy.config.symbolsData = this.reelsData.symbolsData;

    EventHandler.addEventListener(SlotEvents.START_SPIN, this.startSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.QUICK_STOP_SPIN, this.stopSpinQuick.bind(this));
    EventHandler.addEventListener(SlotEvents.STOP_SPIN_AFTER_RESPONSE, this.startStoppingSpin.bind(this));
    EventHandler.addEventListener(SlotEvents.RENDER_UNFINISHED_REEL, this.renderUnfinishedReel.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION, this.restartIdleAnim.bind(this));
    EventHandler.addEventListener(SlotEvents.IDLE_STATE_ENTRY, this.onIdleStateEntry.bind(this));
    EventHandler.addEventListener(SlotEvents.CREATE_FINAL_REEL_SYMBOLS, this.createFinalReelSymbols.bind(this));
    EventHandler.addEventListener(SlotEvents.STOP_REEL_FOR_ERROR, this.stopReelForError.bind(this));
    EventHandler.addEventListener(AppEvents.SECONDARY_ASSETS_LOADED, this.onSecondaryAssetsLoaded.bind(this));

    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_START, this.updateUIForAutoStart.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_COUNT, this.updateUIAutoCount.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_STOP, this.onAutoplayEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_FORCE_STOP, this.onAutoplayEnded.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_COUNT, this.updateUIFreeSpinsCount.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_FULLSCREEN_MODE, this.onFullScreenModeChange.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_SYMBOL_PAYOUT, this.hidePayout.bind(this));

    this.winController = new this.configData.winController({
      reels: this.reelsData.noOfReels,
      rows: this.reelsData.noOfRows,
    });
    this.winController.symbolsContainer = this.symbolsContainer;
    this.winController.winSymbolsContainer = this.winSymbolsContainer;
    this.winController.lineWinAmountComp = this.lineWinAmountComp;
    this.winController.slotReel = this;
    this.createReel();

    this.ticker = new Ticker();
    //this.ticker.stop();
    //this.ticker.start();
    this.tickerHandler = this.spinReel.bind(this);
    this.ticker.add(this.tickerHandler);
    this.createAnticipations();
  }

  public destroyView(): void {
    if (this.idleAnimTimeoutId) {
      clearTimeout(this.idleAnimTimeoutId);
      this.idleAnimTimeoutId = null;
    }
    if (this.payoutTimeoutId) {
      clearTimeout(this.payoutTimeoutId);
      this.payoutTimeoutId = null;
    }
    if (this.timeoutIds) {
      for (const id of this.timeoutIds) clearTimeout(id);
      this.timeoutIds.length = 0;
    }
    if (this.timeoutIds2) {
      for (const id of this.timeoutIds2) clearTimeout(id);
      this.timeoutIds2.length = 0;
    }
    if (this.ticker) {
      this.ticker.stop();
      if (this.tickerHandler) {
        this.ticker.remove(this.tickerHandler);
      }
      this.ticker.destroy();
    }
    super.destroyView?.();
  }

  protected updateUIForAutoStart(): void {}
  protected updateUIAutoCount(): void {}
  protected onAutoplayEnded(): void {}
  protected updateUIForFreeSpinsStart(): void {}
  protected updateUIFreeSpinsCount(): void {}
  protected onFreeSpinsEnded(): void {}
  protected onFullScreenModeChange(): void {}

  public getSymbolPosition(x: number, y: number) {
    return this.symbolsArray[x][y].getGlobalPosition();
  }

  public swapSymbol(reel: number, row: number, name: string) {
    this.symbolsArray[reel][row].setNewSymbol(this.reelsData.symbolsData[name], reel);
  }

  protected onSecondaryAssetsLoaded(): void {
    this.recreateAnimations();
  }
  protected stopReelForError(): void {
    this.ticker.stop();
    this.quickSpinStarted = true;

    // Get final symbols from server response
    // Stop all reels immediately
    for (let k = 0; k < this.symbolsArray.length; k++) {
      for (let j = 0; j < this.symbolsArray[k].length; j++) {
        AnimationProxy.killTweensOf(this.symbolsArray[k][j]);
        this.symbolsArray[k][j].destroySymbol();
        this.symbolsArray[k][j].destroy();
      }
    }
    this.symbolsArray = [];
    this.createReel();
  }
  createFinalReelSymbols(): void {
    if (this.reelsData.isFixedSymbol) {
      return;
    }
    let reels = appModel.getReelsView();
    this.finalSymbols = [];
    if (reels) {
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        this.finalSymbols[k] = reels[k];
        this.finalSymbols[k].unshift(this.getRandomSymbolName(k));
        this.finalSymbols[k].push(this.getRandomSymbolName(k));
      }
    } else {
      console.log('no reels data available');
      reels = this.defaultReel;
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        this.finalSymbols[k] = reels[k];
      }
    }
    console.log('finalSymbols', this.finalSymbols);
  }

  public restartIdleAnim(): void {
    this.showIdleAnim(true);
  }

  protected showIdleAnim(flag: boolean = true): void {
    if (flag) {
      clearTimeout(this.idleAnimTimeoutId);
      this.idleAnimTimeoutId = setTimeout(this.showIdleAnimInSymbols.bind(this), 3000);
    } else {
      clearTimeout(this.idleAnimTimeoutId);
    }
  }

  protected showIdleAnimInSymbols(): void {
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      let row: number = 0;
      if (this.reelsData.isFixedSymbol) {
        row = Util.getRandomRange(0, this.reelsData.noOfRows - 1);
      } else {
        row = 1; //Util.getRandomRange(1, this.reelsData.noOfRows); //Util.getRandomRange(1, this.reelsData.noOfRows);
      }

      this.symbolsArray[k][row].showIdle();
    }
    this.showIdleAnim(true);
  }

  protected renderUnfinishedReel(): void {
    if (appModel.isCascadeGame()) {
      const reelsview = appModel.getUnfinishedCascadeReel();
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        if (this.reelsData.isFixedSymbol) {
          for (let j = 0; j < this.reelsData.noOfRows; j++) {
            this.symbolsArray[k][j].setNewSymbol(this.reelsData.symbolsData[reelsview[k][j]], k);
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
  protected createReel() {
    this.landingSymbolsCount = {};
    const landingSymbols = this.reelsData.landingSymbols;
    landingSymbols.forEach((symbol, index) => {
      this.landingSymbolsCount[symbol] = [index, 0];
    });
    // Keep for backward compatibility, but recommend using setReels instead
    this.reelsIndexes = [];
    this.defaultReel = [];
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      if (this.reelsData.initialReelStop && this.reelsData.initialReelStop.length > 0) {
        this.reelsIndexes.push(this.reelsData.initialReelStop[k]);
      } else {
        this.reelsIndexes.push(Util.getRandomRange(0, this.reelsData.reelsConfig.maingame[k].length - 1));
      }
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.defaultReel[k] = [];
      this.symbolsArray[k] = [];
      this.reelSpinningState.push(0);
      const rows: number = this.reelsData.isFixedSymbol ? this.reelsData.noOfRows : this.reelsData.noOfRows + 2;
      for (let j = 0; j < rows; j++) {
        const symb = this.getFirstTimeSymbol(k, j);
        this.defaultReel[k].push(symb.getSymbolName());
        this.symbolsContainer.addChild(symb);
        this.symbolsArray[k].push(symb);
        UIUtil.addInteraction(symb, this.onSymbolClicked.bind(this, symb));
      }
    }
    this.winController.symbolsArray = this.symbolsArray;
    this.createReelMask();

    this.repositionView();
    this.showHideExtraSymbols();
  }

  protected onIdleStateEntry(): void {
    this.showHideExtraSymbols(false);
    this.setSymbolsClickable(true);
  }

  protected createReelMask(): void {
    this.maskRect = this.elementsList['maskRect'];
    this.symbolsContainer.mask = this.maskRect;
  }
  protected recreateAnimations(): void {
    const len1: number = this.symbolsArray.length;
    for (let i = 0; i < len1; i++) {
      const len2 = this.symbolsArray[i].length;
      for (let j = 0; j < len2; j++) {
        this.symbolsArray[i][j].recreateAnimation();
      }
    }
  }

  protected showHideExtraSymbols(flag: boolean = false): void {
    if (this.reelsData.isFixedSymbol) {
      return;
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.symbolsArray[k][0].visible = flag;
      this.symbolsArray[k][this.symbolsArray[k].length - 1].visible = flag;
    }
  }
  protected clearSymbolCallBakcFunction() {
    this.symbolsArray.forEach((symbols) => {
      symbols.forEach((symbol) => {
        symbol.clearCallBackAnimation();
      });
    });
  }
  protected startSpin(): void {
    this.anticipationRunning = [];
    this.scatterAnticipArray = [];
    this.symbolPassedCounterArray = [];
    this.stopStarted = [];
    this.startAnticipationReel = [];
    this.reelsCompleted = [];
    this.currentReel = 0;
    this.totalSymbols = 0;
    this.clearSymbolCallBakcFunction();
    this.setSymbolsClickable(false);
    this.showIdleAnim(false);
    this.resetSpinParams();
    this.hidePayout();
    this.timeoutIds = [];
    this.timeoutIds2 = [];
    this.quickSpinStarted = false;
    this.numberOfStoppedReels = 0;
    this.spinStarted = true;
    this.showHideExtraSymbols(true);
    this.stopIndex = [];
    for (const name in this.landingSymbolsCount) {
      this.landingSymbolsCount[name][1] = 0;
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.stopIndex[k] = this.reelsData.noOfRows + 1;
      this.reelSpinningState[k] = 0;
      this.anticipationRunning[k] = false;
      this.stopStarted[k] = false;
      this.reelSpinningState[k] = -1;
      this.reelsCompleted[k] = false;
      this.symbolPassedCounterArray[k] = 0;
      this.startAnticipationReel[k] = false;
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.timeoutIds2[k] = setTimeout(
        this.startReelStripSpin.bind(this, k),
        appModel.turboMode ? k * reelSpinStartGap * 0.25 : k * reelSpinStartGap,
      );
    }
    this.ticker.start();
  }

  protected startReelStripSpin(reelno: number): void {
    if (this.quickSpinStarted) {
      return;
    }
    this.reelSpinningState[reelno] = 1;
  }

  protected spinReel(ticker: Ticker): void {
    if (this.spinStarted) {
      for (let k = 0; k < this.reelsData.noOfReels; k++) {
        if (this.reelSpinningState[k]) {
          this.moveStripSymbols(k, 1);
        }
      }
    }
  }
  protected moveStripSymbols(reelno: number, delta: number): void {
    switch (this.reelSpinningState[reelno]) {
      case 1:
        this.moveReelUp(reelno, delta);
        break;
      case 2:
        this.doSpinning(reelno, delta);
        break;
      case 3:
        this.stoppingReelStrip(reelno, delta);
        break;
      case 4:
        this.doFinalStop(reelno, delta);
        break;
      case 5:
        this.showFinalJerk(reelno);
        break;
      default:
        break;
    }
  }
  protected moveReelUp(reelno: number, delta: number): void {
    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;
    for (let k = 0; k < len; k++) {
      symbols[k].stopIdleAnim();
      symbols[k].y -= this.movingUpSpeed * delta;
    }
    if (symbols[1].y < this.maxUpY) {
      this.reelSpinningState[reelno] = 2;
      for (let k = 0; k < len; k++) {
        symbols[k].setBlurredTexture();
      }
    }
  }
  protected doSpinning(reelno: number, delta: number): void {
    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;
    if (this.spinningSpeed < this.maxSpeed) {
      this.spinningSpeed += this.speedFactor;
    } else {
      this.spinningSpeed = this.maxSpeed;
    }
    for (let k = 0; k < len; k++) {
      symbols[k].y += this.spinningSpeed * delta;
    }
    const lastSymbol = symbols[symbols.length - 1];
    if (lastSymbol.y > this.reelsData.reelHeight) {
      lastSymbol.setNewSymbol(this.getNextSymbolData(reelno), reelno);
      lastSymbol.y = symbols[0].y - this.reelsData.symbolHeight;
      symbols.splice(symbols.length - 1, 1);
      symbols.unshift(lastSymbol);
      if (this.anticipationRunning[reelno]) {
        this.symbolPassedCounterArray[reelno]++;
        this.checkToStopReelStrip(reelno);
      } else if (this.currentReel == reelno) {
        this.symbolPassedCounterArray[reelno] += 1;
        this.checkToStopReelStrip(reelno);
      }
    }
  }

  // ----------- stop spin --------------------
  protected startStoppingSpin(): void {
    if (this.quickSpinStarted) {
      return;
    }
    this.spinResponseReceived = true;
    if (appModel.turboMode) {
      this.stopSpinQuick();
      return;
    }
    this.createScatterAnticipationArray();
    this.checkToStopReelStrip(0);
  }
  protected stopReelStrip(reelno: number): void {
    if (this.quickSpinStarted) {
      return;
    }
    this.reelSpinningState[reelno] = 3;
  }
  protected stoppingReelStrip(reelno: number, delta: number): void {
    const symbols = this.symbolsArray[reelno];
    if (this.spinningSpeed > this.minSpeed) {
      this.spinningSpeed -= this.speedFactor;
    } else {
      this.spinningSpeed = this.minSpeed;
    }
    const len = symbols.length;
    for (let k = 0; k < len; k++) {
      symbols[k].y += this.spinningSpeed * delta;
    }
    const lastSymbol = symbols[symbols.length - 1];
    if (lastSymbol.y > this.reelsData.reelHeight * 1.1) {
      if (this.stopIndex[reelno] < 0) {
        this.reelSpinningState[reelno] = 4;
      } else {
        const symb = this.finalSymbols[reelno][this.stopIndex[reelno]];
        this.stopIndex[reelno]--;

        const newSymbolType = this.reelsData.symbolsData[symb];
        if (newSymbolType == null) {
          throw new Error('There is no new symbol to spin on the queue.');
        }
        console.log('newSymbolType', reelno, symb, this.finalSymbols);
        lastSymbol.setNormalTexture();
        lastSymbol.setNewSymbol(newSymbolType, reelno);
        // lastSymbol.setNormalTexture();
        lastSymbol.y = symbols[0].y - this.reelsData.symbolHeight;
        symbols.splice(symbols.length - 1, 1);
        symbols.unshift(lastSymbol);
      }
    }
  }
  protected doFinalStop(reelno: number, delta: number): void {
    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;
    for (let k = 0; k < len; k++) {
      symbols[k].y += this.spinningSpeed * delta;
    }
    const lastSymbol = symbols[1];
    if (lastSymbol.y > this.maxDownY) {
      this.currentReel = reelno + 1;
      this.reelSpinningState[reelno] = 5;
    }
  }

  protected showFinalJerk(reelno: number): void {
    this.destroyAnticipation(reelno);
    this.reelSpinningState[reelno] = 0;

    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;

    this.showLandinAnimation(reelno);
    let landingSoundPlayed = false;
    for (let k = 0; k < len; k++) {
      if (k > 0 && k <= this.reelsData.noOfRows) {
        const symbolName = symbols[k].getSymbolName();
        if (this.landingSymbolsCount[symbolName]) {
          const count = this.landingSymbolsCount[symbolName][1];
          this.landingSymbolsCount[symbolName][1]++;
          landingSoundPlayed = true;
          EventHandler.dispatchEvent(`PLAY_SYMBOL_${symbolName}_LANDING_SOUND`, count + 1);
        }
      }
      if (k == len - 1) {
        AnimationProxy.animateTween(symbols[k], {
          y: (k - 1) * this.reelsData.symbolHeight,
          duration: appModel.turboMode ? this.jerkDuration * 0.5 : this.jerkDuration,
          ease: customEase,
          onComplete: this.onReelStripStopped.bind(this, reelno),
        });
      } else {
        AnimationProxy.animateTween(symbols[k], {
          y: (k - 1) * this.reelsData.symbolHeight,
          duration: appModel.turboMode ? this.jerkDuration * 0.5 : this.jerkDuration,
          ease: customEase,
        });
      }
    }
    EventHandler.dispatchEvent(SlotEvents.PLAY_STRIP_JERK_SOUND);
    if (reelno == this.reelsData.noOfReels - 1) {
      EventHandler.dispatchEvent(SlotEvents.STOP_REEL_SPIN_SOUND);
      console.log('-------------------------------------');
    }
  }
  public showLandinAnimation(reelno: number) {
    const landingSymbol = this.reelsData.landingSymbols || [];
    if (landingSymbol?.length) {
      this.symbolsArray[reelno].forEach((symbol, index) => {
        if (
          index > 0 &&
          index < this.symbolsArray[reelno].length &&
          landingSymbol.indexOf(symbol.getSymbolName()) > -1
        ) {
          symbol.showLanding();
        }
      });
    }
  }
  protected onReelStripStopped(reelno: number): void {
    this.numberOfStoppedReels++;

    this.setAllNormalTexture(reelno);
    if (this.numberOfStoppedReels == this.reelsData.noOfReels) {
      this.hideAllAnticipation();
      const len = this.timeoutIds.length;
      for (let k = 0; k < len; k++) {
        clearTimeout(this.timeoutIds[k]);
      }
      const len2 = this.timeoutIds2.length;
      for (let k = 0; k < len2; k++) {
        clearTimeout(this.timeoutIds2[k]);
      }
      StateManager.doNextStep();
    }
  }

  protected stopSpinQuick(): void {
    if (!this.spinStarted) return;
    this.spinResponseReceived = true;
    this.ticker.stop();
    this.quickSpinStarted = true;

    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.stopReelQuick(k);
    }
  }

  protected setAllNormalTexture(reelno): void {
    const len = this.symbolsArray[reelno].length;
    for (let k = 0; k < len; k++) {
      this.symbolsArray[reelno][k].resetSymbol();
    }
  }
  protected stopReelQuick(reelno: number): void {
    EventHandler.dispatchEvent(SlotEvents.PLAY_STRIP_JERK_SOUND);
    this.reelSpinningState[reelno] = 0;
    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;

    // Set final symbols - finalSymbols has extra symbols at start and end
    // symbols array: [hidden, visible1, visible2, visible3, hidden]
    // finalSymbols: [random, symbol1, symbol2, symbol3, random]
    if (this.finalSymbols[reelno]) {
      for (let k = 0; k < len; k++) {
        if (this.finalSymbols[reelno][k]) {
          const symbolData = this.reelsData.symbolsData[this.finalSymbols[reelno][k]];
          if (symbolData) {
            symbols[k].setNewSymbol(symbolData, reelno);
          }
        }
      }
    }

    // Clean up symbols
    for (let k = 0; k < len; k++) {
      symbols[k].setNormalTexture();
      symbols[k].cleanUpSymbolWin();
    }

    // Quick jerk animation
    const quickEase = Elastic.easeOut.config(0.8, 0.4);
    const quickDuration = 0.15;

    for (let k = 0; k < len; k++) {
      symbols[k].visible = true;
      if (k === len - 1) {
        AnimationProxy.animateTween(symbols[k], {
          duration: quickDuration,
          y: (k - 1) * this.reelsData.symbolHeight,
          ease: quickEase,
          onComplete: this.onReelStripStopped.bind(this, reelno),
        });
      } else {
        AnimationProxy.animateTween(symbols[k], {
          duration: quickDuration,
          y: (k - 1) * this.reelsData.symbolHeight,
          ease: quickEase,
        });
      }
    }
    if (reelno == this.reelsData.noOfReels - 2) {
      EventHandler.dispatchEvent(SlotEvents.STOP_REEL_SPIN_SOUND);
    }
  }

  // ---------------- end of spin --------------------
  // check reelstop
  public checkToStopReelStrip(reelno: number) {
    if (reelno == 0) {
      const symbolsCount = GameProxy?.config?.reelSpinSettings?.firstReelSymbolPassCount || 5;
      if (this.symbolPassedCounterArray[reelno] >= symbolsCount - this.totalSymbols && this.spinResponseReceived) {
        if (!this.stopStarted[reelno]) {
          this.stopStarted[reelno] = true;
          this.reelSpinningState[reelno] = 3;
        }
      }
    } else {
      let symbolsCount = GameProxy?.config?.reelSpinSettings?.otherReelsSymbolPassCount || 2;
      let totalcount = symbolsCount - this.totalSymbols;
      if (DeviceProxy.isDevice()) {
        if (DeviceProxy.config.isPortrait) {
          totalcount = symbolsCount - this.totalSymbols - 1;
        } else {
          totalcount = symbolsCount - this.totalSymbols;
        }
      }
      if (this.anticipationRunning[reelno]) {
        symbolsCount = GameProxy?.config?.reelSpinSettings?.anticipationSymbolPassCount || 25;
        totalcount = symbolsCount - this.totalSymbols;
        if (DeviceProxy.isDevice()) {
          if (DeviceProxy.config.isPortrait) {
            totalcount = symbolsCount - this.totalSymbols - 1;
          } else {
            totalcount = symbolsCount - this.totalSymbols;
          }
        }
      }
      if (
        this.symbolPassedCounterArray[reelno] >= totalcount &&
        this.currentReel == reelno &&
        this.spinResponseReceived
      ) {
        const nofScatter = this.getNumberOfScatter(reelno);
        if (!this.anticipationRunning[reelno] && nofScatter && nofScatter[0] > 1) {
          EventHandler.dispatchEvent('PLAY_ANTICIPATION_SOUND');
          this.showNextAnticipation(reelno);
          // this.startAnticipationSymbolCount[reelno] = true;
          this.anticipationRunning[reelno] = true;
          this.symbolPassedCounterArray[reelno] = 0;
          // this.destroyAnticipation(reelno);
          return;
        }
        if (!this.stopStarted[reelno] && this.reelSpinningState[reelno] == 2) {
          this.reelSpinningState[reelno] = 3;
          this.stopStarted[reelno] = true;
        }
      }
    }
  }
  //  ------------------------------ anticipation -----------------------------
  protected createScatterAnticipationArray() {
    const len = appModel.getReelsView().length;
    let totalScatters = 0;
    this.scatterAnticipArray[0] = [0];
    for (let k = 0; k < len; k++) {
      this.scatterAnticipArray[k] = [];
      const reel = appModel.getReelsView()[k - 1];
      if (reel) {
        const symbLen = reel.length;
        const scattersLen = this.configData.data.anticipationSymbols?.length;
        if (scattersLen) {
          for (let p = 0; p < scattersLen; p++) {
            for (let i = 1; i < symbLen - 1; i++) {
              const landinglen = this.configData.data.anticipationSymbols.length;
              if (landinglen) {
                for (let j = 0; j < landinglen; j++) {
                  if (reel[i] === this.configData.data.anticipationSymbols[j]) {
                    totalScatters++;
                  }
                }
              }
            }
            this.scatterAnticipArray[k].push(totalScatters);
          }
        }
      }
    }
  }
  // create anticipation
  protected createAnticipations() {
    if (this.reelsData.anticipationConfig) {
      const len = this.reelsData.anticipationConfig.totalElements;
      for (let k = 0; k < len; k++) {
        if (k === 0) {
          this.anticipationElementArray.push(null);
          continue;
        }
        const element = UIUtil.getElement(this.reelsData.anticipationConfig.element);
        this.anticipationContainer.addChild(element);
        element.stopAnimation();
        element.visible = false;
        this.anticipationElementArray.push(element);
        this.anticipationContainer.addChild(element);
      }
      this.addChild(this.anticipationContainer);
    }
  }
  // stop anticipations
  protected destroyAnticipation(reelno) {
    if (this.anticipationElementArray && this.anticipationElementArray[reelno]) {
      AnimationProxy.animateTween(this.anticipationElementArray[reelno], {
        duration: this.jerkDuration * 0.5,
        alpha: 0,
      });
      this.hideAnticipationStrip(reelno);
    }
  }
  protected hideAnticipationStrip(reelno) {
    if (this.reelsData.anticipationConfig) {
      this.anticipationElementArray[reelno].stopAnimation();
      this.anticipationElementArray[reelno].visible = false;
      this.anticipationElementArray[reelno].alpha = 1;
      EventHandler.dispatchEvent('STOP_ANTICIPATION_SOUND');
    }
  }
  protected hideAllAnticipation() {
    this.anticipationElementArray.forEach((el) => {
      if (el === null) return;
      el.visible = false;
      el.stopAnimation();
    });
    EventHandler.dispatchEvent('STOP_ANTICIPATION_SOUND');
  }

  protected showNextAnticipation(reelno: number) {
    this.anticipationRunning[reelno] = true;
    this.anticipationElementArray.forEach((anticipation, index) => {
      if (index >= reelno) {
        anticipation.alpha = 1;
        anticipation.visible = true;
        anticipation.playAnimation({ state: 'animation', loop: true });
      }
    });
  }
  protected getNumberOfScatter(reelno): number[] {
    if (appModel.turboMode || this.reelsData.anticipationConfig == null) {
      return [0];
    }
    if (this.scatterAnticipArray?.[reelno] != undefined) {
      return this.scatterAnticipArray[reelno];
    } else {
      return [0];
    }
  }
  //--------------------end of anticipation

  protected onSymbolClicked(symb: ReelSymbolSprite): void {
    //if (appModel.gameResult && appModel.getSpinWin() > 0) return;
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    if (this.currentPayoutSymbol) {
      this.symbolsContainer.addChild(this.currentPayoutSymbol);
    }
    UIUtil.setClickable(this.modalRect, true);
    this.modalRect.visible = true;
    this.symbolPayoutComp.visible = true;
    this.winSymbolsContainer.addChild(this.symbolPayoutComp);
    this.winSymbolsContainer.addChild(symb);
    const reelno = symb.getReelNumber();
    this.symbolPayoutComp.showComp(symb.getSymbolNameForPayout(), reelno < this.reelsData.noOfReels - 2);
    this.currentPayoutSymbol = symb;
    if (reelno < this.reelsData.noOfReels - 2) {
      this.symbolPayoutComp.x =
        symb.x - this.reelsData.symbolHeight / 2 - this.symbolPayoutComp.width * this.symbolPayoutComp.getXPadding();
    } else {
      this.symbolPayoutComp.x =
        symb.x +
        this.reelsData.symbolHeight / 2 -
        this.symbolPayoutComp.width * (1 - this.symbolPayoutComp.getXPadding() * 0.65);
    }
    this.symbolPayoutComp.y =
      symb.y - this.reelsData.symbolHeight / 2 - (this.symbolPayoutComp.height - this.reelsData.symbolHeight) / 2;
    clearTimeout(this.payoutTimeoutId);
    this.payoutTimeoutId = setTimeout(this.hidePayout.bind(this), 2000);
  }
  protected hidePayout(): void {
    clearTimeout(this.payoutTimeoutId);
    this.symbolPayoutComp.visible = false;
    if (this.currentPayoutSymbol) {
      this.symbolsContainer.addChild(this.currentPayoutSymbol);
    }
    UIUtil.setClickable(this.modalRect, false);
    this.modalRect.visible = false;
  }
  protected setSymbolsClickable(flag: boolean): void {
    const len1: number = this.symbolsArray.length;
    for (let i = 0; i < len1; i++) {
      const len2 = this.symbolsArray[i].length;
      for (let j = 0; j < len2; j++) {
        UIUtil.setClickable(this.symbolsArray[i][j], flag);
      }
    }
  }

  protected getRandomSymbolName(reelno: number): string {
    const symbols = this.reelsData.reelsConfig.maingame[reelno];
    return symbols[Util.getRandomRange(0, symbols.length - 1)];
  }
  protected getRandomSymbol(reelno: number) {
    const symbols = this.reelsData.reelsConfig.maingame[reelno];
    const symbol = symbols[Util.getRandomRange(0, symbols.length - 1)];
    const data: any = { ...this.reelsData.symbolsData[symbol], reelNumber: reelno };
    return new this.reelsData.symbolClass({ data: data });
  }
  protected getNextSymbolName(reelno: number): string {
    const reelSymbols: string[] = this.reelsData.reelsConfig.maingame[reelno];
    const symbol = reelSymbols[this.reelsIndexes[reelno]++];
    // reset to 0 once reaches end
    if (this.reelsIndexes[reelno] > reelSymbols.length - 1) {
      this.reelsIndexes[reelno] = 0;
    }
    // return 'H1';
    return symbol;
  }
  protected getNextSymbol(reelno: number) {
    const symbol = this.getNextSymbolName(reelno);
    const data: any = { ...this.reelsData.symbolsData[symbol], reelNumber: reelno };
    return new this.reelsData.symbolClass({ data: data });
  }

  protected getFirstTimeSymbol(reelno: number, rowIndex: number) {
    if (rowIndex == 0 || rowIndex == this.reelsData.noOfRows + 1) {
      return this.getNextSymbol(reelno);
    }
    const symbol = this.reelsData.initialReel[reelno][rowIndex - 1];
    const data: any = { ...this.reelsData.symbolsData[symbol], reelNumber: reelno };
    return new this.reelsData.symbolClass({ data: data });
  }
  protected getNextSymbolData(reelno: number) {
    const symbol = this.getNextSymbolName(reelno);
    return this.reelsData.symbolsData[symbol];
  }

  public resetReelForError(): void {}
  public showTumbleWin(): void {
    this.winController.showTumbleWin();
    this.reelFrame?.showWin();
  }
  public showSpinWin(): void {
    this.winController.showSpinWin();
    this.reelFrame?.showWin();
  }
  public clearSpinWin(): void {
    this.winController.clearSpinWin();
  }
  public showLineWin(): void {
    this.winController.showLineWin();
  }
  public showScatterTrigger(): void {
    this.winController.showScatterTrigger();
  }

  // ----------------------------------------------------

  protected resetSpinParams(): void {
    this.movingUpSpeed = 10;
    this.maxSpeed = 80;
    this.minSpeed = 70;
    this.speedFactor = 2;
    this.spinningSpeed = 0;
    this.maxUpY = -60;
    this.maxDownY = 40;
    this.jerkDuration = 0.75;
    this.reelStopGap = 200;
  }

  // -------------------------
  protected repositionView(): void {
    this.setDeviceWisePositionData();
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      for (let j = 0; j < this.symbolsArray[k].length; j++) {
        const symb = this.symbolsArray[k][j];
        if (this.reelsData.symbolScale) {
          symb.scale.set(this.reelsData.symbolScale);
        }
        symb.x = this.reelsData.reelPositionX[k];
        if (this.reelsData.isFixedSymbol) {
          symb.y = j * this.reelsData.symbolHeight;
        } else {
          symb.y = (j - 1) * this.reelsData.symbolHeight;
        }
      }
    }
    if (this.reelsData.reelContainerPos) {
      this.symbolsContainer.x = this.reelsData.reelContainerPos.x;
      this.symbolsContainer.y = this.reelsData.reelContainerPos.y;
      this.winSymbolsContainer.x = this.reelsData.reelContainerPos.x;
      this.winSymbolsContainer.y = this.reelsData.reelContainerPos.y;
      if (this.anticipationContainer) {
        this.anticipationContainer.x = this.reelsData.reelContainerPos.x;
        this.anticipationContainer.y = this.reelsData.reelContainerPos.y;
      }
    }
  }

  protected setDeviceWisePositionData(): void {
    if (DeviceProxy.isDesktop()) {
      for (const p in this.reelsData.deviceLayout.Desktop) {
        this.reelsData[p] = this.reelsData.deviceLayout.Desktop[p];
      }
    } else if (DeviceProxy.config.isPortrait) {
      for (const p in this.reelsData.deviceLayout.Portrait) {
        this.reelsData[p] = this.reelsData.deviceLayout.Portrait[p];
      }
    } else {
      for (const p in this.reelsData.deviceLayout.Landscape) {
        this.reelsData[p] = this.reelsData.deviceLayout.Landscape[p];
      }
    }
    this.winController.reelsData = this.reelsData;
  }

  protected resizeView(): void {
    if (this.slotGuideRect) {
      const rect = this.guideRect;
      this.slotGuideRect.width = rect.getBounds().width;
      this.slotGuideRect.height = rect.getBounds().height;
      const local = this.toLocal(this.parent.toGlobal(new Point(rect.x, rect.y)));
      this.slotGuideRect.x = local.x;
      this.slotGuideRect.y = local.y;
    }
    super.resizeView();
    this.setAnticipationPosition();
  }
  setAnticipationPosition() {
    if (DeviceProxy.isDevice()) {
      if (DeviceProxy.config.isPortrait) {
        this.anticipationElementArray.forEach((element, index) => {
          if (element === null) return;
          const anticipationConfig = this.reelsData.anticipationConfig.positions[index];
          if (DeviceProxy.config.isTablet && anticipationConfig.tpScale) {
            element.x = anticipationConfig.tpx;
            element.y = anticipationConfig.tpy;
            element.scale.set(anticipationConfig.tpScale.x, anticipationConfig.tpScale.y);
          } else {
            element.x = anticipationConfig.px;
            element.y = anticipationConfig.py;
            if (anticipationConfig.pScale) {
              element.scale.set(anticipationConfig.pScale.x, anticipationConfig.pScale.y);
            }
          }
        });
      } else {
        this.anticipationElementArray.forEach((element, index) => {
          if (element === null) return;
          const anticipationConfig = this.reelsData.anticipationConfig.positions[index];
          if (DeviceProxy.config.isTablet && anticipationConfig.tpScale) {
            element.x = anticipationConfig.tpx;
            element.y = anticipationConfig.tpy;
            element.scale.set(anticipationConfig.tpScale.x, anticipationConfig.tpScale.y);
          } else {
            element.x = anticipationConfig.lx;
            element.y = anticipationConfig.ly;
            if (anticipationConfig.pScale) {
              element.scale.set(anticipationConfig.lScale.x, anticipationConfig.lScale.y);
            }
          }
        });
      }
    } else {
      this.anticipationElementArray.forEach((element, index) => {
        if (element === null) return;
        const anticipationConfig = this.reelsData.anticipationConfig.positions[index];
        element.x = anticipationConfig.x;
        element.y = anticipationConfig.y;
        if (anticipationConfig.scale) {
          element.scale.set(anticipationConfig.scale.x, anticipationConfig.scale.y);
        }
      });
    }
  }
}
