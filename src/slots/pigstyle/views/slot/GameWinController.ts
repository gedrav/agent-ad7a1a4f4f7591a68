import WinController from '@core/views/slotmachine/WinController';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';

export default class GameWinController extends WinController {
  public showLineWin(): void {
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
    appModel.lineWinIndex++;
    if (appModel.lineWinIndex > appModel.getWinDataLength() - 1) {
      appModel.lineWinIndex = 0;
    }
  }

  public showSpinWin(): void {
    const positions: any[] = appModel.gameResult?.featureTriggerPositions;
    const winData = appModel.getWinData();

    if (positions && positions.length > 0) {
      if (!winData || winData.length === 0) {
        this.fadeOutAllSymbols();
        this.animateScatters(positions);

        const delay = GameProxy?.config?.featureTriggerDelay || 2000;
        clearTimeout((this as any).timeoutId);
        (this as any).timeoutId = setTimeout(() => {
          this.notifySpinWinDone();
        }, delay);
        return;
      } else {
        super.showSpinWin();
        this.animateScatters(positions);
        return;
      }
    }

    super.showSpinWin();
  }

  private animateScatters(positions: any[]): void {
    EventHandler.dispatchEvent(SlotEvents.PLAY_FEATURE_TRIGGER_SOUND, positions.length);

    for (let j = 0; j < positions.length; j++) {
      const pos = this.getReelPosition(positions[j]);

      const symb = (this as any).reelsData.isFixedSymbol
        ? this.symbolsArray[pos.reel][pos.row]
        : this.symbolsArray[pos.reel][pos.row + 1];

      if (symb) {
        symb.alpha = 1;
        if ((symb as any).symbol) {
          (symb as any).symbol.alpha = 1;
          if ((symb as any).symbol.tint !== undefined) {
            (symb as any).symbol.tint = 0xffffff;
          }
        }

        this.winSymbolsContainer.addChild(symb);
        symb.showWinning(null, true);
      }
    }
  }
}
