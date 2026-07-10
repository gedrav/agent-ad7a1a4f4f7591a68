import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Clock } from '@core/utils/Clock';

class PreSpinWinStateCommand extends StateCommand {
  private readonly timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);

    const coinPositions = appModel.gameResult?.coinPositions;
    let hasCoins = false;

    if (coinPositions) {
      for (const key in coinPositions) {
        if (coinPositions[key] && coinPositions[key].length > 0) {
          hasCoins = true;
          break;
        }
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

export const PreSpinWinState = new PreSpinWinStateCommand();
