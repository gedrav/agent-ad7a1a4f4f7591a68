import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class SpinStoppedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.REELSPIN_COMPLETED);
    EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_BUTTON);
    StateManager.next();
  }
}

export const SpinStoppedState = new SpinStoppedStateCommand();
