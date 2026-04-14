import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { PixText } from '@core/pixiwrapper/PixText';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import SlotReel from '@core/views/slotmachine/SlotReel';
export default class WinController {
  private noOfRows: number;
  private noOfReels: number;
  public symbolsContainer;
  public winSymbolsContainer;
  public lineWinAmountComp;
  public slotReel: SlotReel;
  public reelsData;
  private timeoutId: any;
  private tumbleWinAmountTexts: PixText[] = [];
  protected winSymbolIndex: number;
  protected totalWinSymbols: number;

  get symbolsArray(): ReelSymbolSprite[][] {
    return this._symbolsArray;
  }

  set symbolsArray(value: ReelSymbolSprite[][]) {
    this._symbolsArray = value;
  }
  private _symbolsArray: ReelSymbolSprite[][] = [];

  constructor(data: any) {
    this.noOfReels = data.reels;
    this.noOfRows = data.rows;
  }

  public showScatterTrigger(): void {
    const positions: number[] = appModel.getFeatureTriggerPositions();
    if (positions && positions.length > 0) {
      const len = positions.length;
      for (let j = 0; j < len; j++) {
        const pos = this.getReelPosition(positions[j]);
        if (this.reelsData.isFixedSymbol) {
          this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row]);
          this.symbolsArray[pos.reel][pos.row].showFeatureTriggerAnimation();
        } else {
          this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
          this.symbolsArray[pos.reel][pos.row + 1].showFeatureTriggerAnimation();
        }
      }
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(this.notifyFeatureTriggerAnimDone.bind(this), 2000);
    }
  }
  protected notifyFeatureTriggerAnimDone(): void {
    clearTimeout(this.timeoutId);
    StateManager.doNextStep();
  }
  public showTumbleWin(): void {
    this.winSymbolIndex = 0;
    this.totalWinSymbols = 0;
    if (appModel.isCascadeGame()) {
      this.clearTumbleWinTexts();
      const tumbleData = appModel.getSpinBlastData();
      const blastSymbols = appModel.getSpinBlastSymbols();
      if (blastSymbols) {
        this.fadeOutAllSymbols();
        blastSymbols.forEach((blastSymbol: any, index: number) => {
          const symbWinAmount = tumbleData[index].winAmount;
          blastSymbol.forEach((position: number[], index: number) => {
            const pos = { reel: position[0], row: this.reelsData.isFixedSymbol ? position[1] : position[1] + 1 };
            this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row]);
            this.symbolsArray[pos.reel][pos.row].showWinning(() =>
              this.onSpinWinAnimComplete(this.symbolsArray[pos.reel][pos.row]),
            );
            this.totalWinSymbols++;
            if (index === 2 && symbWinAmount > 0) {
              const tConfig = {
                name: 'symbWinAmount',
                type: 'BitmapText',
                anchor: { x: 0.5, y: 0.5 },
                style: {
                  fontFamily: 'bitmapFont',
                  fill: 0xffffff,
                  fontSize: 250,
                },
              };
              let winAmountText = UIUtil.getElement(tConfig) as PixText;
              winAmountText.text = symbWinAmount;
              winAmountText.x = this.symbolsArray[pos.reel][pos.row].x;
              winAmountText.y =
                this.symbolsArray[pos.reel][pos.row].y +
                this.symbolsArray[pos.reel][pos.row].height / 2 -
                winAmountText.height / 2;
              this.winSymbolsContainer.addChild(winAmountText);
              this.tumbleWinAmountTexts.push(winAmountText);
              AnimationProxy.animateTween(winAmountText, {
                delay: 0.5,
                y: winAmountText.y - this.symbolsArray[pos.reel][pos.row].height * 0.7,
                scaleX: 0.9,
                scaleY: 0.9,
                alpha: 0.25,
                duration: 1,
                onComplete: () => {
                  this.removeTumbleWinText(winAmountText);
                  winAmountText = null;
                },
              });
            }
          });
        });
      }
    }
    clearTimeout(this.timeoutId);
    //this.timeoutId = setTimeout(this.notifySpinWinDone.bind(this), 2000);
  }

  protected onSpinWinAnimComplete(symbol: ReelSymbolSprite): void {
    this.winSymbolIndex++;
    if (this.winSymbolIndex === this.totalWinSymbols) {
      setTimeout(this.notifySpinWinDone.bind(this), 0);
    }
  }

  public showSpinWin(): void {
    this.winSymbolIndex = 0;
    this.totalWinSymbols = 0;
    if (appModel.isCascadeGame()) {
      const blastSymbols = appModel.getSpinBlastSymbols();
      if (blastSymbols) {
        this.fadeOutAllSymbols();
        blastSymbols.forEach((blastSymbol: any) => {
          blastSymbol.forEach((position: number[]) => {
            this.totalWinSymbols++;
            const pos = { reel: position[0], row: this.reelsData.isFixedSymbol ? position[1] : position[1] + 1 };
            this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row]);
            this.symbolsArray[pos.reel][pos.row].showWinning(() =>
              this.onSpinWinAnimComplete(this.symbolsArray[pos.reel][pos.row]),
            );
          });
        });
      }
    } else {
      const winDataLength = appModel.getWinDataLength();
      if (winDataLength > 0) {
        this.fadeOutAllSymbols();
        for (let i = 0; i < winDataLength; i++) {
          this.totalWinSymbols++;
          const winData = appModel.getWinData();
          const winningPos = winData[i].winningPosition;
          if (winningPos && winningPos.length > 0) {
            for (let j = 0; j < winningPos.length; j++) {
              const pos = this.getReelPosition(winData[i].winningPosition[j]);
              this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
              this.symbolsArray[pos.reel][pos.row + 1].showWinning(() =>
                this.onSpinWinAnimComplete(this.symbolsArray[pos.reel][pos.row]),
              );
            }
          }
        }
      }
    }
    // clearTimeout(this.timeoutId);
    // this.timeoutId = setTimeout(this.notifySpinWinDone.bind(this), 2000);
  }
  protected notifySpinWinDone(): void {
    clearTimeout(this.timeoutId);
    StateManager.doNextStep();
  }

  public showLineWin(): void {
    if (appModel.isCascadeGame()) {
      // No line win for cascade game
    } else {
      this.winSymbolIndex = 0;
      this.totalWinSymbols = 0;
      const winDataLength = appModel.getWinDataLength();
      if (winDataLength > 0) {
        this.fadeOutAllSymbols();
        const currentLineWin = appModel.getCurrentLineWinData();
        const winningPos = currentLineWin?.winningPosition;
        if (winningPos && winningPos.length > 0) {
          for (let j = 0; j < winningPos.length; j++) {
            const pos = this.getReelPosition(winningPos[j]);
            this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
            this.symbolsArray[pos.reel][pos.row + 1].showWinning(() =>
              this.onLineWinAnimComplete(this.symbolsArray[pos.reel][pos.row]),
            );
            this.totalWinSymbols++;
            if (j == 0) {
              this.lineWinAmountComp.visible = true;
              this.lineWinAmountComp.x = this.symbolsArray[pos.reel][pos.row + 1].x + this.winSymbolsContainer.x;
              this.lineWinAmountComp.y = this.symbolsArray[pos.reel][pos.row + 1].y + this.winSymbolsContainer.y;
              this.lineWinAmountComp.showWin(currentLineWin.winAmount);
            }
          }
        }
      }
    }
    appModel.lineWinIndex++;
    if (appModel.lineWinIndex > appModel.getWinDataLength() - 1) {
      appModel.lineWinIndex = 0;
    }
  }
  protected onLineWinAnimComplete(symbol: ReelSymbolSprite): void {
    this.winSymbolIndex++;
    if (this.winSymbolIndex == this.totalWinSymbols) {
      StateManager.doNextStep();
    }
  }
  public clearSpinWin(): void {
    clearTimeout(this.timeoutId);
    this.lineWinAmountComp.reset();
    this.clearTumbleWinTexts();
    const len1 = this.symbolsArray.length;
    for (let i = 0; i < len1; i++) {
      const len2 = this.symbolsArray[i].length;
      for (let j = 0; j < len2; j++) {
        const symbol = this.symbolsArray[i][j];
        this.symbolsContainer.addChild(symbol);
        symbol.cleanUpSymbolWin();
      }
    }
  }

  protected fadeOutAllSymbols(): void {
    const len1 = this.symbolsArray.length;
    for (let i = 0; i < len1; i++) {
      const len2 = this.symbolsArray[i].length;
      for (let j = 0; j < len2; j++) {
        const symbol = this.symbolsArray[i][j];
        symbol.showFaded();
      }
    }
  }
  protected getReelPosition(value: number): any {
    const reel = value % this.noOfReels; // which column
    const row = Math.floor(value / this.noOfReels); // which row
    return { reel: reel, row: row };
  }

  private clearTumbleWinTexts(): void {
    if (this.tumbleWinAmountTexts.length === 0) {
      return;
    }
    while (this.tumbleWinAmountTexts.length > 0) {
      const text = this.tumbleWinAmountTexts.pop();
      if (!text) {
        continue;
      }
      AnimationProxy.killTweensOf(text);
      if (text.parent) {
        text.parent.removeChild(text);
      }
      text?.destroy({ children: true, texture: true });
    }
  }

  private removeTumbleWinText(text: PixText): void {
    const index = this.tumbleWinAmountTexts.indexOf(text);
    if (index === -1) {
      return;
    }
    this.tumbleWinAmountTexts.splice(index, 1);
    AnimationProxy.killTweensOf(text);
    if (text.parent) {
      text.parent.removeChild(text);
    }
    text.destroy({ children: true, texture: true });
  }
}
