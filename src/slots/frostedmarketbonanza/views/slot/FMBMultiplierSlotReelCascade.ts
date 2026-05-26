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
  private nudgeShakeCompleteCount = 0;
  private nudgeShakeTotalCount = 0;
  private nudgeShiftCompleteCount = 0;
  private nudgeShiftTotalCount = 0;
  private nudgeReels: number[] = [];
  private nudgeReelIndex = 0;

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
    this.nudgeReelIndex = 0;
    this.nudgeCurrentReel();
  }

  private nudgeCurrentReel() {
    if (this.nudgeReelIndex >= this.nudgeReels.length) {
      StateManager.doNextStep();
      return;
    }
    const column = this.symbolsArray?.[this.nudgeReels[this.nudgeReelIndex]];
    if (!column || !column.length) {
      this.onReelNudgeComplete();
      return;
    }
    const SHAKE_STEP = 0.1;
    const SHAKE_REPEAT = 3; // odd to repeat+1 & even to ends back at base
    const amplitude = this.reelsData.symbolHeight * 0.12;
    this.nudgeShakeCompleteCount = 0;
    this.nudgeShakeTotalCount = 0;
    for (const symbol of column) {
      if (!symbol) continue;
      this.nudgeShakeTotalCount++;
      const baseY = symbol.y;
      AnimationProxy.animateTween(symbol, {
        y: baseY + amplitude,
        duration: SHAKE_STEP,
        repeat: SHAKE_REPEAT,
        yoyo: true,
        ease: 'sine.inOut',
        onComplete: () => {
          symbol.y = baseY;
          this.onSymbolNudgeShakeComplete();
        },
      });
    }
    if (this.nudgeShakeTotalCount === 0) {
      this.onReelNudgeComplete();
    }
  }

  private onSymbolNudgeShakeComplete() {
    this.nudgeShakeCompleteCount++;
    if (this.nudgeShakeCompleteCount === this.nudgeShakeTotalCount) {
      this.onReelNudgeComplete();
    }
  }

  private async onReelNudgeComplete() {
    this.nudgeShakeCompleteCount = 0;
    this.nudgeShakeTotalCount = 0;
    await Util.addDelays(250);
    this.shiftNudgedReelDown();
  }

  private shiftNudgedReelDown() {
    const reel = this.nudgeReels[this.nudgeReelIndex];
    const column = this.symbolsArray?.[reel];
    const finalReelView = appModel.gameResult?.cascadeData?.[0]?.reelView;
    if (!column || !column.length || !finalReelView) {
      this.onReelNudgeShiftDone();
      return;
    }
    const symbolHeight = this.configData.data.symbolHeight;
    this.nudgeShiftCompleteCount = 0;
    this.nudgeShiftTotalCount = 0;

    const newTopSymbol = column.pop() as CascadeReelSymbol;
    column.unshift(newTopSymbol);
    const newTopName = finalReelView[reel]?.[0];
    newTopSymbol.resetScale();
    newTopSymbol.setNormalTexture();
    newTopSymbol.setNewSymbol(this.reelsData.symbolsData[newTopName], reel);
    newTopSymbol.y = -symbolHeight;

    // drop every symbol down by one cell
    for (let i = 0; i < column.length; i++) {
      this.nudgeShiftTotalCount++;
      AnimationProxy.animateTween(column[i], {
        y: i * symbolHeight,
        duration: 0.32,
        ease: Back.easeOut.config(0.6),
        onComplete: this.onReelShiftComplete.bind(this),
      });
    }
    if (this.nudgeShiftTotalCount === 0) {
      this.onReelNudgeShiftDone();
    }
  }

  private onReelShiftComplete() {
    this.nudgeShiftCompleteCount++;
    if (this.nudgeShiftCompleteCount === this.nudgeShiftTotalCount) {
      this.onReelNudgeShiftDone();
    }
  }

  private async onReelNudgeShiftDone() {
    this.nudgeShiftCompleteCount = 0;
    this.nudgeShiftTotalCount = 0;
    await Util.addDelays(500);
    this.nudgeReelIndex++;
    this.nudgeCurrentReel();
  }

  //-------------------------------------------
}
