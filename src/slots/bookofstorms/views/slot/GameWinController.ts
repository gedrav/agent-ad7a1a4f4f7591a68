import WinController from '@core/views/slotmachine/WinController';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

export default class GameWinController extends WinController {
  public showLineWin(): void {
    if (!appModel.isCascadeGame() && appModel.getWinDataLength() > 0) {
      this.fadeOutAllSymbols();
      this.winSymbolIndex = 0;
      this.totalWinSymbols = 0;
      this.lineWinAmountComp.reset();
      this.lineWinAmountComp.visible = false;
      const currentLineWin = appModel.getCurrentLineWinData();
      const winningPos = currentLineWin?.winningPosition;
      if (winningPos && winningPos.length > 0) {
        const multiplier = currentLineWin.multiplier ?? 1;
        for (let j = 0; j < winningPos.length; j++) {
          const pos = this.getReelPosition(winningPos[j]);
          this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
          this.symbolsArray[pos.reel][pos.row + 1].showWinning(() =>
            this.onLineWinAnimComplete(this.symbolsArray[pos.reel][pos.row]),
          );
          this.totalWinSymbols++;
          if (j === 0) {
            this.lineWinAmountComp.visible = true;
            this.lineWinAmountComp.x = this.symbolsArray[pos.reel][pos.row + 1].x + this.winSymbolsContainer.x;
            this.lineWinAmountComp.y = this.symbolsArray[pos.reel][pos.row + 1].y + this.winSymbolsContainer.y;
            this.lineWinAmountComp.showWin(currentLineWin.winAmount, multiplier);
            if (this.lineWinAmountComp.width / 2 > this.slotReel.slotGuideRect.x) {
              this.lineWinAmountComp.x = this.slotReel.slotGuideRect.x + this.lineWinAmountComp.width / 2;
            }
          }
        }
        EventHandler.dispatchEvent('PLAY_SYMBOL_LINE_WIN_' + currentLineWin.symbol);
      }
    }
    appModel.lineWinIndex++;
    if (appModel.lineWinIndex > appModel.getWinDataLength() - 1) {
      appModel.lineWinIndex = 0;
    }
  }
}
