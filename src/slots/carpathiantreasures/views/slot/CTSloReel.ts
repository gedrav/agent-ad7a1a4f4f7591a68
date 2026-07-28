import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Sine } from 'gsap';
import ReelSymbol from '@core/views/slotmachine/ReelSymbol';

const WILD_SYMBOL_NAME = 'WD';

interface WildPosition {
  reelID: number;
  rowID: number;
}

export interface WildAppearEvent {
  reelID: number;
  rowID: number;
  isLast: boolean;
}
export class CTSlotReel extends SlotReelStandard {
  constructor(config: any) {
    super(config);
    EventHandler.addEventListener('EXPAND_WILD', this.expandWildSym.bind(this));
  }

  // iterating over all the reels needed to be expanded
  private expandWildSym(data: number[]): void {
    const positions = this.collectExpandablePositions(data);

    positions.forEach(({ reelID, rowID }, index) => {
      const isLast = index === positions.length - 1;
      this.expandSymbolToWild(reelID, rowID, isLast);
    });
  }

  //   interating over all the symbols of the reel
  private collectExpandablePositions(data: number[]): WildPosition[] {
    const positions: WildPosition[] = [];

    for (const reelID of data) {
      const reelSymbols = this.symbolsArray[reelID];
      if (!reelSymbols) continue;

      const visibleRowCount = reelSymbols.length - 2;

      for (let rowID = 0; rowID < visibleRowCount; rowID++) {
        const symbol: ReelSymbol = reelSymbols[rowID + 1];
        if (!symbol) continue;
        if (symbol.getSymbolName() === WILD_SYMBOL_NAME) continue;

        positions.push({ reelID, rowID });
      }
    }

    return positions;
  }

  // scaling down he previous sym except WILD and disspatching and event to replace the sym
  private expandSymbolToWild(reelID: number, rowID: number, isLast: boolean): void {
    const symbol: ReelSymbol = this.symbolsArray[reelID][rowID + 1];
    if (!symbol) return;

    // AnimationProxy.animateTween(symbol.scale, {
    //     duration: 0.5,
    //     x: 0,
    //     y: 0,
    //     ease: Sine.easeIn,
    //     onComplete: () => {
    const eventData: WildAppearEvent = { reelID, rowID, isLast };
    EventHandler.dispatchEvent('Wildappear', eventData);
    symbol.scale.set(1);
    symbol.replaceSymbol(this.reelsData.symbolsData.WD, 0);

    //     },
    // });
  }
}
