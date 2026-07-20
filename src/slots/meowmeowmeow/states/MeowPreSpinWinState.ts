import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

function hasNonEmpty(arr: any): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

// Base game format: coinPositions.red / .blue / .green
// Free spin format: redCoinPositions / blueCoinPositions / greenCoinPositions
function hasCoins(gameResult: any): boolean {
  const coinPositions = gameResult?.coinPositions;
  return (
    hasNonEmpty(coinPositions?.red) ||
    hasNonEmpty(coinPositions?.blue) ||
    hasNonEmpty(coinPositions?.green) ||
    hasNonEmpty(gameResult?.redCoinPositions) ||
    hasNonEmpty(gameResult?.blueCoinPositions) ||
    hasNonEmpty(gameResult?.greenCoinPositions)
  );
}

class MeowPreSpinWinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    if (hasCoins(appModel.gameResult)) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_COIN_ANIMATION);
    } else {
      StateManager.next();
    }
  }

  public doNextStep(): void {
    StateManager.next();
  }
}

export const MeowPreSpinWinState = new MeowPreSpinWinStateCommand();
