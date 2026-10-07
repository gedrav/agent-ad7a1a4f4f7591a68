import WinController from '@core/views/slotmachine/WinController';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';

export default class GameWinController extends WinController {
  private maskRect: PixGraphics;
  private triggerTimeoutId: any;

  public showLineWin(): void {
    if (!this.maskRect) {
      this.maskRect = this.slotReel?.elementsList['maskRect'];
    }

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

            if (this.maskRect) {
              const maskLeft = this.maskRect.x;

              const winAmountLeftEdge = this.lineWinAmountComp.x - this.lineWinAmountComp.width / 2;

              if (winAmountLeftEdge < maskLeft) {
                this.lineWinAmountComp.x = maskLeft + this.lineWinAmountComp.width / 2;
              }
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

  public showScatterTrigger(): void {
    const spinResults: any[] = appModel.featureResult?.spinResults;
    const lastSpinResult = spinResults?.[spinResults.length - 1];
    const positions: number[] = lastSpinResult?.droppedPositions ?? appModel.getFeatureTriggerPositions();

    if (positions && positions.length > 2) {
      const len = positions.length;
      for (let j = 0; j < len; j++) {
        const pos = this.getReelPosition(positions[j]);
        if (this.reelsData.isFixedSymbol) {
          this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row]);
          this.symbolsArray[pos.reel][pos.row].showFeatureTriggerAnimation();
        } else {
          this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
          this.symbolsArray[pos.reel][pos.row + 1].showFeatureTriggerAnimation(null, true);
        }
      }
      EventHandler.dispatchEvent(SlotEvents.PLAY_FEATURE_TRIGGER_SOUND, positions.length);
      clearTimeout(this.triggerTimeoutId);
      this.triggerTimeoutId = setTimeout(
        this.notifyFeatureTriggerAnimDone.bind(this),
        Util.getDefaultValue(GameProxy.config.featureTriggerDelay, 4000),
      );
    } else {
      this.notifyFeatureTriggerAnimDone();
    }
  }

  protected notifyFeatureTriggerAnimDone(): void {
    clearTimeout(this.triggerTimeoutId);
    StateManager.doNextStep();
  }
}
