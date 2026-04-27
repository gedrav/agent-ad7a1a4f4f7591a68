import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { StateManager } from '@core/states/StateManagerService';

export default class EOGNCMultiplierSlotReelCascade extends MultiplierSlotReelCascade {
  constructor(configData: any) {
    super(configData);

    EventHandler.addEventListener(SlotEvents.LOWPAY_SYMBOL_CONVERSION, this.showLowPaySymbolConversion.bind(this));
  }

  protected showLowPaySymbolConversion(data?: {
    changedPositions?: Array<[number, number]>;
    selectedHigh?: string;
    selectedLow?: string;
  }) {
    const changedPositions = data?.changedPositions ?? [];
    const selectedHigh = data?.selectedHigh;
    const targetSymbolData = selectedHigh ? this.reelsData.symbolsData[selectedHigh] : null;

    if (!changedPositions.length || !targetSymbolData) {
      this.allSymbolsConverted();
      return;
    }

    let convertedCount = 0;
    const totalSymbolsToConvert = changedPositions.length;

    const symbolsToUpdate: CascadeReelSymbol[] = [];

    const onSymbolConverted = () => {
      convertedCount++;
      if (convertedCount === totalSymbolsToConvert) {
        symbolsToUpdate.forEach((sym) => {
          sym.setNormalTexture();
        });
        this.allSymbolsConverted();
      }
    };

    for (let i = 0; i < totalSymbolsToConvert; i++) {
      const [column, row] = changedPositions[i] ?? [];
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;

      if (symbol) {
        symbolsToUpdate.push(symbol);
        symbol.playSymbolConversion(targetSymbolData, column, onSymbolConverted);
      }
    }
  }

  protected allSymbolsConverted() {
    setTimeout(() => {
      StateManager.doNextStep();
    }, 0);
  }
}
