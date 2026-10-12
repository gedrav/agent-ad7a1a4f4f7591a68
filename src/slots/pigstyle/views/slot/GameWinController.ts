import WinController from '@core/views/slotmachine/WinController';
import { appModel } from '@core/models/services/AppModelService';

export default class GameWinController extends WinController {
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
              this.lineWinAmountComp.x =
                this.symbolsArray[pos.reel][pos.row + 1].x +
                this.winSymbolsContainer.x +
                this.winSymbolsContainer.width * 0.3;
              this.lineWinAmountComp.y =
                this.symbolsArray[pos.reel][pos.row + 1].y +
                this.symbolsArray[pos.reel][pos.row + 1].getHeight() * 0.3 +
                this.winSymbolsContainer.y;
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
}
