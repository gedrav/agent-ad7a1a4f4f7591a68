import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';

export default class EOGNCMultiplierSlotReelCascade extends MultiplierSlotReelCascade {
  private symBlastCompleteCount = 0;
  private newSymAppearanceCompleteCount = 0;
  private totalSymbolsToConvert = 0;
  private changedPositions: Array<[number, number]> = [];
  private targetSymbolData: any = null;

  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(
      SlotEvents.CHARACTER_SYMBOL_CONVERSION_ANIM_COMPLETE,
      this.showSymbolConversion.bind(this),
    );
  }

  protected showSymbolConversion() {
    const result = appModel.getReelModifiersData();
    this.changedPositions = result?.changedPositions ?? [];
    const selectedHigh = result?.selectedHigh;
    this.targetSymbolData = selectedHigh ? this.reelsData.symbolsData[selectedHigh] : null;

    if (!this.changedPositions.length || !this.targetSymbolData) {
      this.allSymbolsConverted();
      return;
    }

    this.symBlastCompleteCount = 0;
    this.newSymAppearanceCompleteCount = 0;
    this.totalSymbolsToConvert = this.changedPositions.length;

    for (let i = 0; i < this.totalSymbolsToConvert; i++) {
      const [column, row] = this.changedPositions[i];
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
      symbol.playSymbolConversion(this.onSymbolConverted.bind(this));
    }
  }

  private onSymbolConverted(): void {
    this.symBlastCompleteCount++;
    if (this.symBlastCompleteCount === this.totalSymbolsToConvert) {
      this.changedPositions.forEach(([column, row], index) => {
        const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
        symbol.showNewSymbAfterConversion(this.targetSymbolData, column, this.onNewSymbolAppeared.bind(this));
      });
    }
  }

  protected onNewSymbolAppeared(): void {
    this.newSymAppearanceCompleteCount++;
    if (this.newSymAppearanceCompleteCount === this.totalSymbolsToConvert) {
      this.allSymbolsConverted();
    }
  }

  protected allSymbolsConverted() {
    StateManager.doNextStep();
  }
}
