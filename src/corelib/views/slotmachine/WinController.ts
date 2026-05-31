import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { PixText } from '@core/pixiwrapper/PixText';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import SlotReel from '@core/views/slotmachine/SlotReel';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';
import { CONSTANTS } from '@core/utils/CONSTANTS';
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
      EventHandler.dispatchEvent(SlotEvents.PLAY_FEATURE_TRIGGER_SOUND, positions?.length);
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(this.notifyFeatureTriggerAnimDone.bind(this), 2000);
    }
  }
  protected notifyFeatureTriggerAnimDone(): void {
    clearTimeout(this.timeoutId);
    StateManager.doNextStep();
  }
  public async showTumbleWin(): Promise<void> {
    this.winSymbolIndex = 0;
    this.totalWinSymbols = 0;
    if (appModel.isCascadeGame()) {
      this.clearTumbleWinTexts();
      const tumbleData = appModel.getSpinBlastData();
      const blastSymbols = appModel.getSpinBlastSymbols();
      if (blastSymbols && blastSymbols.length > 0) {
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
              const sym = this.symbolsArray[pos.reel][pos.row];
              const maxWid = this.reelsData.symbolHeight;
              const winAmountText: any = new this.reelsData.winValueComponent();
              winAmountText.showValue(Util.formatCurrencyNoSymbol(symbWinAmount));
              winAmountText.x = sym.x;
              winAmountText.y = sym.y + this.reelsData.symbolHeight / 2 - winAmountText.height / 2;
              winAmountText.scale.set(1);
              if (maxWid && winAmountText.width > maxWid) {
                const sc = maxWid / winAmountText.width;
                winAmountText.scale.set(sc);
              }
              this.winSymbolsContainer.addChild(winAmountText);
              this.tumbleWinAmountTexts.push(winAmountText);
              AnimationProxy.animateTween(winAmountText, {
                delay: 1,
                y: winAmountText.y - this.reelsData.symbolHeight * 0.7,
                alpha: 0.25,
                duration: 1,
                ease: 'Power2.easeOut',
                onComplete: () => {
                  this.removeTumbleWinText(winAmountText);
                },
              });
            }
          });
        });
        const len = this.tumbleWinAmountTexts.length;
        if (len > 0) {
          for (let k = 0; k < len; k++) {
            this.winSymbolsContainer.addChild(this.tumbleWinAmountTexts[k]);
          }
        }
        if (appModel.turboMode) {
          EventHandler.dispatchEvent(
            SlotEvents.PLAY_TURBO_TUMBLE_WIN_SOUND,
            (appModel.tumbleIndex + 1) % Util.getDefaultValue(GameProxy.config.cascadeTumbleSoundCount, 6),
          );
        } else {
          EventHandler.dispatchEvent(
            SlotEvents.PLAY_TUMBLE_WIN_SOUND,
            (appModel.tumbleIndex + 1) % Util.getDefaultValue(GameProxy.config.cascadeTumbleSoundCount, 6),
          );
        }
        //below is only for if win animation and blast animation are included in single animation
        if (this.reelsData.onlyWinAnim) {
          const delay = this.reelsData.blastAftWinDelay ? this.reelsData.blastAftWinDelay : 500;
          await Util.addDelays(delay);
          const len1 = tumbleData.length;
          if (len1 > 0) {
            for (let k = 0; k < len1; k++) {
              EventHandler.dispatchEvent(SlotEvents.PLAY_TUMBLE_BLAST_SOUND, tumbleData[k].symbol);
            }
          }
        }
      } else {
        this.notifySpinWinDone();
      }
    }
  }

  protected onSpinWinAnimComplete(symbol: ReelSymbolSprite): void {
    this.winSymbolIndex++;
    if (this.winSymbolIndex === this.totalWinSymbols) {
      this.notifySpinWinDone();
    }
  }

  public showSpinWin(): void {
    this.winSymbolIndex = 0;
    this.totalWinSymbols = 0;
    const winType = appModel.getWinType();
    //const winType: string = CONSTANTS.UNBELIEVABLE_WIN;
    if (winType === CONSTANTS.BELOW_TOTALBET_WIN || winType === CONSTANTS.STANDARD_WIN) {
      if (appModel.isCascadeGame()) {
        const blastSymbols = appModel.getSpinBlastSymbols();
        this.fadeOutAllSymbols();
        if (blastSymbols && blastSymbols.length > 0) {
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
        const positions: number[] = appModel.getFeatureTriggerPositions();
        if (positions && positions.length > 0) {
          EventHandler.dispatchEvent(SlotEvents.PLAY_SCATTER_WIN_SOUND, positions.length);
          const len = positions.length;
          for (let j = 0; j < len; j++) {
            const pos = this.getReelPosition(positions[j]);
            if (this.reelsData.isFixedSymbol) {
              this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row]);
              this.symbolsArray[pos.reel][pos.row].showWinning(() =>
                this.onSpinWinAnimComplete(this.symbolsArray[pos.reel][pos.row]),
              );
            } else {
              this.winSymbolsContainer.addChild(this.symbolsArray[pos.reel][pos.row + 1]);
              this.symbolsArray[pos.reel][pos.row + 1].showWinning(() =>
                this.onSpinWinAnimComplete(this.symbolsArray[pos.reel][pos.row + 1]),
              );
            }
          }
        }
      } else {
        const winDataLength = appModel.getWinDataLength();
        if (winDataLength > 0) {
          this.fadeOutAllSymbols();
          const doneSymbols = [];
          for (let i = 0; i < winDataLength; i++) {
            const winData = appModel.getWinData();
            const winningPos = winData[i].winningPosition;
            if (winningPos && winningPos.length > 0) {
              for (let j = 0; j < winningPos.length; j++) {
                const pos = this.getReelPosition(winData[i].winningPosition[j]);
                const symb = this.symbolsArray[pos.reel][pos.row + 1];
                if (doneSymbols.indexOf(symb) > -1) {
                } else {
                  this.totalWinSymbols++;
                }
                doneSymbols.push(symb);
                this.winSymbolsContainer.addChild(symb);
                symb.showWinning(() => this.onSpinWinAnimComplete(symb));
              }
            }
          }
        }
      }
    } else {
      if (!appModel.isCascadeGame()) {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(this.notifySpinWinDone.bind(this), 2000);
      }
    }
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
              this.lineWinAmountComp.x =
                this.symbolsArray[pos.reel][pos.row + 1].x +
                this.winSymbolsContainer.x +
                this.winSymbolsContainer.width * 0.25;
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
    if (Array.isArray(value)) {
      const reel = value[0];
      const row = value[1];
      return { reel: reel, row: row };
    } else {
      const reel = value % this.noOfReels; // which column
      const row = Math.floor(value / this.noOfReels); // which row
      return { reel: reel, row: row };
    }
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

  private removeTumbleWinText(text: any): void {
    const index = this.tumbleWinAmountTexts.indexOf(text);
    if (index === -1) {
      return;
    }

    this.tumbleWinAmountTexts.splice(index, 1);
    AnimationProxy.killTweensOf(text);
    text.destroyComp();
    if (text.parent) {
      text.parent.removeChild(text);
    }
    text.destroy({ children: true, texture: true });
  }
}
