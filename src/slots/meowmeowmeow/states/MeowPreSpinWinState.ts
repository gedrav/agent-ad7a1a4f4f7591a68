import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class MeowPreSpinWinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const coinPositions = appModel.gameResult?.coinPositions;
    let hasCoins = false;

    // Base game format: coinPositions.red / .blue / .green
    if (coinPositions) {
      if (
        (coinPositions.red && coinPositions.red.length > 0) ||
        (coinPositions.blue && coinPositions.blue.length > 0) ||
        (coinPositions.green && coinPositions.green.length > 0)
      ) {
        hasCoins = true;
      }
    }

    // Free spin format: greenCoinPositions / redCoinPositions / blueCoinPositions
    if (!hasCoins) {
      const gr = appModel.gameResult;
      if (
        (gr?.greenCoinPositions && gr.greenCoinPositions.length > 0) ||
        (gr?.redCoinPositions && gr.redCoinPositions.length > 0) ||
        (gr?.blueCoinPositions && gr.blueCoinPositions.length > 0)
      ) {
        hasCoins = true;
      }
    }

    if (hasCoins) {
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
