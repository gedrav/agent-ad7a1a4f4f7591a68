import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import SlotReelCascade from '@core/views/slotmachine/SlotReelCascade';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { CascadeReelWinTicker } from '../comps/CascadeReelWinTicker';
import { GameProxy } from '@core/models/GameConfigProxy';
import { FsTotalMultiplierComp } from '../comps/FsTotalMultiplierComp';
import { Power1, Power2, Back } from 'gsap/gsap-core';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import ReelSymbol from '@core/views/slotmachine/ReelSymbol';
import { gsap } from 'gsap';

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

    const onSymbolConverted = () => {
      convertedCount++;
      if (convertedCount >= totalSymbolsToConvert) {
        this.allSymbolsConverted();
      }
    };

    for (let i = 0; i < totalSymbolsToConvert; i++) {
      const [column, row] = changedPositions[i] ?? [];
      const symbol = this.symbolsArray?.[column]?.[row] as CascadeReelSymbol;
      symbol.playSymbolConversion(targetSymbolData, column, onSymbolConverted);
    }
  }

  protected allSymbolsConverted() {
    StateManager.doNextStep();
  }
}
