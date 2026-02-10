import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { Ticker } from 'pixi.js';
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

const reelSpinStartGap = 100;
const customEase = Elastic.easeOut.config(1.4, 0.6);

export default class SlotReel extends ResponsesiveChildrenView {
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
  protected winController: WinController;
  protected quickSpinStarted: boolean;
  protected speedFactor: number;
  protected lineWinAmountComp: LineWinAmountComp;
  protected reelFrame: ReelFrameComp;
  protected symbolPayoutComp: SymbolPayoutComp;
  private currentPayoutSymbol: ReelSymbolSprite;
  private payoutTimeoutId: any;
  private modalRect: PixGraphics;
  protected spinResponseReceived: boolean;

  constructor(configData: any) {
    super(configData);
    this.symbolsContainer = this.elementsList['symbolsContainer'];
    this.winSymbolsContainer = this.elementsList['winSymbolsContainer'];
    this.lineWinAmountComp = this.elementsList['lineWinAmountComp'];
    this.reelFrame = this.elementsList['reelFrame'];
    this.symbolPayoutComp = this.winSymbolsContainer.elementsList['symbolPayoutComp'];
    this.modalRect = this.elementsList['modalRect'];
    this.modalRect.alpha = 0;
    UIUtil.setClickable(this.modalRect, false);
    UIUtil.addInteraction(this.modalRect, this.hidePayout.bind(this));

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

    this.winController = new this.configData.winController({
      reels: this.reelsData.noOfReels,
      rows: this.reelsData.noOfRows,
    });
    this.winController.symbolsContainer = this.symbolsContainer;
    this.winController.winSymbolsContainer = this.winSymbolsContainer;
    this.winController.lineWinAmountComp = this.lineWinAmountComp;
    this.createReel();

    this.ticker = new Ticker();
    //this.ticker.stop();
    //this.ticker.start();
    this.ticker.add(this.spinReel.bind(this));
  }

  public restartIdleAnim(): void {
    this.showIdleAnim(true);
  }

  protected showIdleAnim(flag: boolean = true): void {
    if (flag) {
      clearTimeout(this.idleAnimTimeoutId);
      this.idleAnimTimeoutId = setTimeout(this.showIdleAnimInSymbols.bind(this), 2500);
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
        row = Util.getRandomRange(1, this.reelsData.noOfRows);
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
    // Keep for backward compatibility, but recommend using setReels instead
    this.reelsIndexes = [];
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      if (this.reelsData.initialReelStop && this.reelsData.initialReelStop.length > 0) {
        this.reelsIndexes.push(this.reelsData.initialReelStop[k]);
      } else {
        this.reelsIndexes.push(Util.getRandomRange(0, this.reelsData.reelsConfig.maingame[k].length - 1));
      }
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.symbolsArray[k] = [];
      this.reelSpinningState.push(0);
      const rows: number = this.reelsData.isFixedSymbol ? this.reelsData.noOfRows : this.reelsData.noOfRows + 2;
      for (let j = 0; j < rows; j++) {
        const symb = this.getNextSymbol(k);
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

  protected showHideExtraSymbols(flag: boolean = false): void {
    if (this.reelsData.isFixedSymbol) {
      return;
    }
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.symbolsArray[k][0].visible = flag;
      this.symbolsArray[k][this.symbolsArray[k].length - 1].visible = flag;
    }
  }

  protected startSpin(): void {
    this.setSymbolsClickable(false);
    this.showIdleAnim(false);
    this.resetSpinParams();
    this.hidePayout();
    this.quickSpinStarted = false;
    this.numberOfStoppedReels = 0;
    this.spinStarted = true;
    this.showHideExtraSymbols(true);
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      setTimeout(
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
    const reels = appModel.getReelsView();
    this.finalSymbols = [];
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.finalSymbols[k] = Util.cloneArray(reels[k]);
      this.finalSymbols[k].unshift(this.getRandomSymbolName(k));
      this.finalSymbols[k].push(this.getRandomSymbolName(k));
      setTimeout(
        this.stopReelStrip.bind(this, k),
        appModel.turboMode ? this.reelStopGap * k * 0.25 : this.reelStopGap * k,
      );
    }
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
      if (this.finalSymbols[reelno].length == 0) {
        this.reelSpinningState[reelno] = 4;
      } else {
        const symb = this.finalSymbols[reelno].pop();
        const newSymbolType = this.reelsData.symbolsData[symb];
        console.log('symb -- ', symb, 'newSymbolType -- ', newSymbolType);
        if (newSymbolType == null) {
          throw new Error('There is no new symbol to spin on the queue.');
        }
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
      this.reelSpinningState[reelno] = 5;
    }
  }

  protected showFinalJerk(reelno: number): void {
    this.reelSpinningState[reelno] = 0;
    const symbols = this.symbolsArray[reelno];
    const len = symbols.length;
    for (let k = 0; k < len; k++) {
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
  }
  protected onReelStripStopped(reelno: number): void {
    this.numberOfStoppedReels++;
    if (this.numberOfStoppedReels == this.reelsData.noOfReels) {
      StateManager.doNextStep();
    }
  }

  protected stopSpinQuick(): void {
    if (!this.spinStarted || !appModel.gameResult) return;
    this.spinResponseReceived = true;
    this.ticker.stop();
    this.quickSpinStarted = true;

    // Get final symbols from server response
    const reels = appModel.getReelsView();
    this.finalSymbols = [];
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.finalSymbols[k] = Util.cloneArray(reels[k]);
      this.finalSymbols[k].unshift(this.getRandomSymbolName(k));
      this.finalSymbols[k].push(this.getRandomSymbolName(k));
    }

    // Stop all reels immediately
    for (let k = 0; k < this.reelsData.noOfReels; k++) {
      this.stopReelQuick(k);
    }
  }

  protected stopReelQuick(reelno: number): void {
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
  }

  // ---------------- end of spin --------------------
  protected onSymbolClicked(symb: ReelSymbolSprite): void {
    if (this.currentPayoutSymbol) {
      this.symbolsContainer.addChild(this.currentPayoutSymbol);
    }
    UIUtil.setClickable(this.modalRect, true);
    this.modalRect.visible = true;
    this.symbolPayoutComp.visible = true;
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
    const data: any = this.reelsData.symbolsData[symbols[Util.getRandomRange(0, symbols.length - 1)]];
    data.reelNumber = reelno;
    return new this.reelsData.symbolClass({ data: data });
  }
  protected getNextSymbol(reelno: number) {
    const symbol = this.reelsData.reelsConfig.maingame[reelno][this.reelsIndexes[reelno]++];
    //reset to 0 once reaches end
    if (this.reelsIndexes[reelno] > this.reelsData.reelsConfig.maingame[reelno].length - 1) {
      this.reelsIndexes[reelno] = 0;
    }
    const data: any = Util.cloneArray(this.reelsData.symbolsData[symbol]);
    data.reelNumber = reelno;
    return new this.reelsData.symbolClass({ data: data });
  }
  protected getNextSymbolData(reelno: number) {
    const symbol = this.reelsData.reelsConfig.maingame[reelno][this.reelsIndexes[reelno]++];
    //reset to 0 once reaches end
    if (this.reelsIndexes[reelno] > this.reelsData.reelsConfig.maingame[reelno].length - 1) {
      this.reelsIndexes[reelno] = 0;
    }
    const data: any = Util.cloneArray(this.reelsData.symbolsData[symbol]);
    return data;
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
    this.maxUpY = -120;
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
    }
  }

  protected setDeviceWisePositionData(): void {
    if (DeviceProxy.isDesktop()) {
      for (const p in this.reelsData.deviceLayout.Desktop) {
        this.reelsData[p] = this.reelsData.deviceLayout.Desktop[p];
      }
    } else {
      if (DeviceProxy.config.isPortrait) {
        for (const p in this.reelsData.deviceLayout.Portrait) {
          this.reelsData[p] = this.reelsData.deviceLayout.Portrait[p];
        }
      } else {
        for (const p in this.reelsData.deviceLayout.Landscape) {
          this.reelsData[p] = this.reelsData.deviceLayout.Landscape[p];
        }
      }
    }
    this.winController.reelsData = this.reelsData;
  }
}
