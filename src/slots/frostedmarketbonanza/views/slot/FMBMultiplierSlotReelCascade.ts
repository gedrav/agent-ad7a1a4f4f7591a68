import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Back } from 'gsap/gsap-core';
import { Util } from '@core/utils/UtilService';

type ChangedPosition = [column: number, row: number];

export default class FMBMultiplierSlotReelCascade extends MultiplierSlotReelCascade {
  private newSymAppearanceCompleteCount = 0;
  private totalSymbolsToConvert = 0;
  private targetSymbolData: any = null;
  private disAppearAnimIndex = 0;
  private nudgeReels: number[] = [];
  private nudgeReelsCompleteCount = 0;

  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(SlotEvents.INITIATE_SYMBOL_CONVERSION, this.setupForSymbolConversion.bind(this));
    EventHandler.addEventListener(SlotEvents.NUDGE_FEATURE_ACTIVATED, this.nudgeReelAndDropNewSymbol.bind(this));
  }

  //conversion methods----------------------------------
  protected setupForSymbolConversion() {
    const result = appModel.getReelModifiersData();
    const selectedHigh = result?.selectedHigh;
    this.targetSymbolData = selectedHigh ? this.reelsData.symbolsData[selectedHigh] : null;
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length || !this.targetSymbolData) {
      this.allSymbolsConverted();
      return;
    }
    this.newSymAppearanceCompleteCount = 0;
    this.totalSymbolsToConvert = changedPositions.length;
    for (const [column, row] of changedPositions) {
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
      if (!symbol) continue;
      symbol.showDisappearingAnim(this.onSymbolsDisapper.bind(this));
    }
  }

  private onSymbolsDisapper() {
    this.disAppearAnimIndex++;
    if (this.disAppearAnimIndex === this.totalSymbolsToConvert) {
      this.makeSymbolsAppear();
    }
  }

  private makeSymbolsAppear() {
    const result = appModel.getReelModifiersData();
    const changedPositions: ChangedPosition[] = result?.changedPositions ?? [];
    if (!changedPositions.length) return;
    changedPositions.forEach((pos, index) => {
      const [column, row] = changedPositions[index];
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
      symbol.visible = true;
      symbol.showAppearingAnim(this.targetSymbolData, column, this.onNewSymbolAppeared.bind(this));
    });
  }
  protected onNewSymbolAppeared(): void {
    this.newSymAppearanceCompleteCount++;
    if (this.newSymAppearanceCompleteCount === this.totalSymbolsToConvert) {
      this.allSymbolsConverted();
    }
  }
  protected allSymbolsConverted() {
    this.disAppearAnimIndex = 0;
    this.totalSymbolsToConvert = 0;
    this.newSymAppearanceCompleteCount = 0;
    this.targetSymbolData = null;
    StateManager.doNextStep();
  }
  //-------------------------------------------------------

  //Nudge methods---------------------------
  private nudgeReelAndDropNewSymbol() {
    const result = appModel.getReelModifiersData();
    const nudgedReelIndices: number[][] = result?.nudgedReelIndices ?? [];
    this.nudgeReels = [...new Set(nudgedReelIndices.map((pair) => pair[0]))];
    this.nudgeAllReels();
  }

  private nudgeAllReels() {
    if (!this.nudgeReels.length) {
      EventHandler.dispatchEvent(SlotEvents.NUDGE_COMPLETED);
      StateManager.doNextStep();
      return;
    }
    const REEL_STAGGER = 0.25; // 250ms between consecutive reels
    this.nudgeReelsCompleteCount = 0;
    this.darkenNonNudgeReels();
    // kick off each reel staggered; each reel drops its new symbol the moment its own shake ends
    this.nudgeReels.forEach((reel, order) => {
      this.nudgeReel(reel, order * REEL_STAGGER);
    });
  }

  private nudgeReel(reel: number, delay: number) {
    const column = this.symbolsArray?.[reel];
    if (!column || !column.length) {
      this.shiftReelDown(reel);
      return;
    }
    const SHAKE_STEP = 0.1;
    const SHAKE_REPEAT = 9; // odd to repeat+1 & even to ends back at base
    const amplitude = this.reelsData.symbolHeight * 0.12;
    let shakeTotal = 0;
    let shakeDone = 0;
    for (const symbol of column) {
      if (!symbol) continue;
      shakeTotal++;
      const baseY = symbol.y;
      AnimationProxy.animateTween(symbol, {
        y: baseY + amplitude,
        duration: SHAKE_STEP,
        delay,
        repeat: SHAKE_REPEAT,
        yoyo: true,
        ease: 'sine.inOut',
        onComplete: () => {
          symbol.y = baseY;
          if (++shakeDone === shakeTotal) {
            this.shiftReelDown(reel); // this reel's nudge done -> drop new symbol now
          }
        },
      });
    }
    if (shakeTotal === 0) {
      this.shiftReelDown(reel);
    }
  }

  private shiftReelDown(reel: number) {
    const finalReelView = appModel.gameResult?.cascadeData?.[0]?.reelView; // taking 0 bcoz the reelmodifier original reel will come at first index of cascade
    const symbolHeight = this.configData.data.symbolHeight;
    const column = this.symbolsArray?.[reel];
    if (!column || !column.length || !finalReelView) {
      this.onReelNudgeComplete();
      return;
    }

    const newTopSymbol = column.pop() as CascadeReelSymbol;
    column.unshift(newTopSymbol);
    const newTopName = finalReelView[reel]?.[0];
    newTopSymbol.resetScale();
    newTopSymbol.setNormalTexture();
    newTopSymbol.setNewSymbol(this.reelsData.symbolsData[newTopName], reel);
    newTopSymbol.y = -symbolHeight;

    let shiftTotal = 0;
    let shiftDone = 0;
    // drop every symbol down by one cell
    for (let i = 0; i < column.length; i++) {
      shiftTotal++;
      AnimationProxy.animateTween(column[i], {
        y: i * symbolHeight,
        duration: 0.32,
        ease: Back.easeOut.config(0.6),
        onComplete: () => {
          if (++shiftDone === shiftTotal) this.onReelNudgeComplete();
        },
      });
    }
    if (shiftTotal === 0) {
      this.onReelNudgeComplete();
    }
  }

  private async onReelNudgeComplete() {
    if (++this.nudgeReelsCompleteCount < this.nudgeReels.length) return;
    await Util.addDelays(500);
    this.removeNudgeDarken();
    EventHandler.dispatchEvent(SlotEvents.NUDGE_COMPLETED);
    StateManager.doNextStep();
  }

  private darkenNonNudgeReels(): void {
    const nudgeSet = new Set(this.nudgeReels);
    this.symbolsArray?.forEach((column, reel) => {
      if (nudgeSet.has(reel)) return;
      column?.forEach((symbol) => symbol?.showFaded());
    });
  }

  private removeNudgeDarken(): void {
    const nudgeSet = new Set(this.nudgeReels);
    this.symbolsArray?.forEach((column, reel) => {
      if (nudgeSet.has(reel)) return;
      column?.forEach((symbol) => symbol?.cleanUpSymbolWin());
    });
  }

  //-------------------------------------------
}
