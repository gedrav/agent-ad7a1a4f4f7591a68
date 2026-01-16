import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

export default class WinController {
  private noOfRows: number;
  private noOfReels: number;
  public symbolsContainer;
  public winSymbolsContainer;
  public lineWinAmountComp;
  public reelsData;
  private timeoutId: any;

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
    console.log(positions);
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
  public showSpinWin(): void {
    if (appModel.isCascadeGame()) {
      const blastSymbols = appModel.getSpinBlastSymbols();
      if (blastSymbols) {
        this.fadeOutAllSymbols();
        blastSymbols.forEach((blastSymbol: any) => {
          blastSymbol.forEach((position: number[]) => {
            const pos = { reel: position[0], row: this.reelsData.isFixedSymbol ? position[1] : position[1] + 1 };
            this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row]);
            this.symbolsArray[pos.reel][pos.row].showWinning();
          });
        });
      }
    } else {
      const winDataLength = appModel.getWinDataLength();
      if (winDataLength > 0) {
        this.fadeOutAllSymbols();
        for (let i = 0; i < winDataLength; i++) {
          const winData = appModel.getWinData();
          const winningPos = winData[i].winningPosition;
          if (winningPos && winningPos.length > 0) {
            for (let j = 0; j < winningPos.length; j++) {
              const pos = this.getReelPosition(winData[i].winningPosition[j]);
              this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
              this.symbolsArray[pos.reel][pos.row + 1].showWinning();
            }
          }
        }
      }
    }
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.notifySpinWinDone.bind(this), 2000);
  }
  protected notifySpinWinDone(): void {
    clearTimeout(this.timeoutId);
    StateManager.doNextStep();
  }

  public showLineWin(): void {
    if (appModel.isCascadeGame()) {
      // No line win for cascade game
    } else {
      const winDataLength = appModel.getWinDataLength();
      if (winDataLength > 0) {
        this.fadeOutAllSymbols();
        const currentLineWin = appModel.getCurrentLineWinData();
        const winningPos = currentLineWin?.winningPosition;
        if (winningPos && winningPos.length > 0) {
          for (let j = 0; j < winningPos.length; j++) {
            const pos = this.getReelPosition(winningPos[j]);
            this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
            this.symbolsArray[pos.reel][pos.row + 1].showWinning();

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
  public clearSpinWin(): void {
    clearTimeout(this.timeoutId);
    this.lineWinAmountComp.reset();
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
}
