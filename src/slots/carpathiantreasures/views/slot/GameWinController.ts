import WinController from '@core/views/slotmachine/WinController';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { SymbolConfig } from '@core/views/slotmachine/ReelSymbol';
import { SpinePool } from '@core/views/slotmachine/SpinePool';
import { WildAppearEvent } from './CTSloReel';
import { WIN_FRAME_SHOW_EVENT, WIN_FRAME_HIDE_EVENT } from './CTReelSymbolSpine';
import { StateManager } from '@core/states/StateManagerService';

interface ActiveWildSpine {
  spine: PixSpine;
  data: SymbolConfig['data'];
}

const WIN_FRAME_SCALE = 0.5;

export default class GameWinController extends WinController {
  private maskRect: PixGraphics;
  private activeWildSpines: ActiveWildSpine[] = [];
  private readonly activeWinFrames: Map<ReelSymbolSprite, PixSpine> = new Map();
  private readonly scatterTriggerTimeoutId: any;
  private isLastLineWinOfPass = false;

  constructor(data: any) {
    super(data);
    EventHandler.addEventListener('Wildappear', this.playWildAppear.bind(this));
    EventHandler.addEventListener('ClearWildSpines', this.clearAllWildSpines.bind(this));
    EventHandler.addEventListener(WIN_FRAME_SHOW_EVENT, this.showWinFrame.bind(this));
    EventHandler.addEventListener(WIN_FRAME_HIDE_EVENT, this.hideWinFrame.bind(this));
  }

  private getWinFrameData(): SymbolConfig['data'] {
    return {
      name: 'win_frame',
      spineName: 'win_frame',
      skin: 'default',
      idleAnim: 'animation',
      winAnim: 'animation',
    };
  }

  private showWinFrame(symbol: ReelSymbolSprite): void {
    if (this.activeWinFrames.has(symbol)) return;
    const spine = SpinePool.getInstance().acquire(this.getWinFrameData());
    spine.x = symbol.x;
    spine.y = symbol.y;
    spine.scale.set(WIN_FRAME_SCALE);
    spine.visible = true;
    this.winSymbolsContainer.addChild(spine);
    spine.playAnimation({ state: 'animation', loop: true });
    this.activeWinFrames.set(symbol, spine);
  }

  private hideWinFrame(symbol: ReelSymbolSprite): void {
    const spine = this.activeWinFrames.get(symbol);
    if (!spine) return;
    spine.stopAnimation();
    spine.visible = false;
    if (spine.parent) {
      spine.parent.removeChild(spine);
    }
    SpinePool.getInstance().release(this.getWinFrameData(), spine);
    this.activeWinFrames.delete(symbol);
  }

  private playWildAppear(data: WildAppearEvent): void {
    const { reelID, rowID, isLast } = data;
    const sym = this.symbolsArray[reelID][rowID + 1];
    const wildData = this.getWildSymbolData();
    if (!wildData) {
      console.warn('GameWinController: no symbol data found for "wild"');
      return;
    }

    const spine = SpinePool.getInstance().acquire(wildData);
    const globalPos = sym.parent.toGlobal({ x: sym.x, y: sym.y });
    const localPos = this.winSymbolsContainer.toLocal(globalPos);
    spine.x = localPos.x;
    spine.y = localPos.y;

    spine.visible = true;
    this.winSymbolsContainer.addChild(spine);
    spine.scale.set(0.84);
    spine.playAnimation({ state: 'appear_1', loop: false });

    if (isLast) {
      setTimeout(() => {
        StateManager.next();
        this.clearAllWildSpines();
      }, 1500);
    }

    this.activeWildSpines.push({ spine, data: wildData });
  }

  private clearAllWildSpines(): void {
    for (const { spine, data } of this.activeWildSpines) {
      spine.x = 0;
      spine.y = 0;
      if (spine.parent) {
        spine.parent.removeChild(spine);
      }
      SpinePool.getInstance().release(data, spine);
    }
    this.activeWildSpines = [];
  }

  private getWildSymbolData(): SymbolConfig['data'] {
    return {
      name: 'WD',
      spineName: 'wild',
      skin: 'default',
      idleAnim: 'idle',
      winAnim: 'win',
    };
  }

  public showScatterTrigger(): void {
    const spinResult: any = appModel.getSpinResult();
    const scatterPositions: number[] = spinResult.scatterPositions || [];
    const bonusPositions: number[] = spinResult.bonusPositions || [];
    const positions = scatterPositions.concat(bonusPositions);

    const scatterWin: number = spinResult.scatterWin || 0;
    const bonusWin: number = spinResult.bonusWin || 0;
    const totalWin = scatterWin + bonusWin;

    if (positions && positions.length > 0 && totalWin > 0) {
      if (!this.maskRect) {
        this.maskRect = this.slotReel?.elementsList['maskRect'];
      }
      this.fadeOutAllSymbols();
      this.winSymbolIndex = 0;
      this.totalWinSymbols = 0;
      this.lineWinAmountComp.reset();
      this.lineWinAmountComp.visible = false;

      const len = positions.length;
      for (let j = 0; j < len; j++) {
        const pos = this.getReelPosition(positions[j]);
        const sym = this.reelsData.isFixedSymbol
          ? this.symbolsArray[pos.reel][pos.row]
          : this.symbolsArray[pos.reel][pos.row + 1];

        this.winSymbolsContainer.addChild(sym);
        sym.showWinning(null, true);
        this.totalWinSymbols++;

        if (j === 0) {
          this.lineWinAmountComp.visible = true;
          this.lineWinAmountComp.x = sym.x + this.winSymbolsContainer.x;
          this.lineWinAmountComp.y = sym.y + this.winSymbolsContainer.y;
          this.lineWinAmountComp.showWin(totalWin);
        }
      }

      setTimeout(() => {
        EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
        this.notifyFeatureTriggerAnimDone();
      }, 4000);
    } else {
      this.notifyFeatureTriggerAnimDone();
    }
  }

  public override showLineWin(): void {
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
    this.isLastLineWinOfPass = appModel.lineWinIndex === 0;
  }

  protected override onLineWinAnimComplete(symbol: ReelSymbolSprite): void {
    this.winSymbolIndex++;
    if (this.winSymbolIndex === this.totalWinSymbols) {
      StateManager.doNextStep();
    }
  }
}
