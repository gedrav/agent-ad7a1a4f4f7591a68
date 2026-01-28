import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class CheckIsTumblePendingStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const isTumblePending = appModel.isTumbleRemaining();
    if (!isTumblePending) {
      StateManager.goToState(STATES.CHECK_TO_COLLECT_MULTIPLIER);
    } else {
      StateManager.next();
    }
  }
}

export const CheckIsTumblePendingState = new CheckIsTumblePendingStateCommand();
