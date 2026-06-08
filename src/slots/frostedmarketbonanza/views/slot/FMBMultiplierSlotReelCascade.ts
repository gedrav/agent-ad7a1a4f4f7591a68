import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';

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
    EventHandler.addEventListener(SlotEvents.NUDGE_REEL_DROP, this.onNudgeReelDrop.bind(this));
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
      symbol.visible = true;
      symbol.showAppearingAnim(this.targetSymbolData, column, this.onNewSymbolAppeared.bind(this));
      EventHandler.dispatchEvent(SlotEvents.PLAY_SYMBOL_APPEAR_SOUND);
    }
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
    if (!this.nudgeReels.length) {
      EventHandler.dispatchEvent(SlotEvents.NUDGE_COMPLETED);
      StateManager.doNextStep();
      return;
    }
    this.nudgeReelsCompleteCount = 0;
    this.darkenNonNudgeReels();
    // per-reel symbol drop is driven by NUDGE_REEL_DROP (fired by NudgeAnticipationComp after its anticipation)
  }

  private onNudgeReelDrop(reel: number) {
    this.shiftReelDown(reel);
  }

  private shiftReelDown(reel: number, delay = 0) {
    const finalReelView = appModel.gameResult?.cascadeData?.[0]?.reelView; // taking 0 bcoz the reelmodifier original reel will come at first index of cascade
    const symbolHeight = this.configData.data.symbolHeight;
    const column = this.symbolsArray?.[reel];
    if (!column || !column.length || !finalReelView) {
      this.onReelSettled(reel);
      return;
    }

    // logic to keep the bottom symbol untill the new one slides in
    const newTopName = finalReelView[reel]?.[0];
    const newTopSymbol = this.createNudgeTopSymbol(reel, newTopName);
    newTopSymbol.y = -symbolHeight;
    column.unshift(newTopSymbol);

    let shiftTotal = 0;
    let shiftDone = 0;
    for (let i = 0; i < column.length; i++) {
      shiftTotal++;
      AnimationProxy.animateTween(column[i], {
        y: i * symbolHeight,
        duration: 0.6,
        delay,
        ease: 'power1.inOut',
        onComplete: () => {
          if (++shiftDone === shiftTotal) {
            this.removeExitedBottomSymbol(reel);
            this.onReelSettled(reel);
          }
        },
      });
    }
    if (shiftTotal === 0) {
      this.onReelSettled(reel);
    }
  }

  // reel finished dropping/settling -> hide its anticipation + count toward completion
  private onReelSettled(reel: number) {
    EventHandler.dispatchEvent(SlotEvents.NUDGE_REEL_SETTLED, reel);
    this.onReelNudgeComplete();
  }

  private createNudgeTopSymbol(reel: number, symbolName: string): CascadeReelSymbol {
    const data: any = {
      ...this.reelsData.symbolsData[symbolName],
      reelNumber: reel,
      multiplierTextConfig: this.reelsData.multiplierTextConfig,
    };
    const symbol = new this.reelsData.symbolClass({ data }) as CascadeReelSymbol;
    if (this.reelsData.symbolScale) symbol.scale.set(this.reelsData.symbolScale);
    symbol.x = this.reelsData.reelPositionX[reel];
    symbol.resetScale();
    symbol.setNormalTexture();
    symbol.setNewSymbol(this.reelsData.symbolsData[symbolName], reel);
    this.symbolsContainer.addChild(symbol);
    UIUtil.addInteraction(symbol, this.onSymbolClicked.bind(this, symbol));
    return symbol;
  }

  // cleanup for the old bottom symbol
  private removeExitedBottomSymbol(reel: number): void {
    const column = this.symbolsArray?.[reel];
    if (!column || !column.length) return;
    const exited = column.pop() as CascadeReelSymbol;
    exited.destroySymbol();
    exited.destroyView();
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
