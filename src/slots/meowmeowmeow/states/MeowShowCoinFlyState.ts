import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class MeowShowCoinFlyStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const coinPositions = appModel.gameResult?.coinPositions;
    let hasCoins = false;

    if (coinPositions) {
      if (
        (coinPositions.red && coinPositions.red.length > 0) ||
        (coinPositions.blue && coinPositions.blue.length > 0) ||
        (coinPositions.green && coinPositions.green.length > 0)
      ) {
        hasCoins = true;
      }
    }

    if (hasCoins) {
      EventHandler.dispatchEvent('MEOW_SHOW_COIN_ANIMATION');
    } else {
      StateManager.next();
    }
  }

  public doNextStep(): void {
    StateManager.next();
  }
}

export const MeowShowCoinFlyState = new MeowShowCoinFlyStateCommand();
