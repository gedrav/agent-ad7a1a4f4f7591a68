import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';

type ChangedPosition = [column: number, row: number];

export default class FMBMultiplierSlotReelCascade extends MultiplierSlotReelCascade {
  private newSymAppearanceCompleteCount = 0;
  private totalSymbolsToConvert = 0;
  private targetSymbolData: any = null;
  private disAppearAnimIndex = 0;

  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(SlotEvents.INITIATE_SYMBOL_CONVERSION, this.setupForSymbolConversion.bind(this));
  }

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
}
