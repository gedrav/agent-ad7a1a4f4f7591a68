import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { Clock } from '@core/utils/Clock';
import { StateManager } from '@core/states/StateManagerService';

class SpinResponseReceivedStateCommand extends StateCommand {
  private readonly timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.SHOW_STOPSPIN_BUTTON);
    EventHandler.dispatchEvent(SlotEvents.MULTIPLIER_SET_TO_LEVEL, 1); // reset multiplier to lvl1 after each spin
    EventHandler.dispatchEvent(SlotEvents.STOP_SPIN_AFTER_RESPONSE);
    if (appModel.getIsPromoFSSession()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_BUTTON);
    StateManager.next();
  }
}
export const SpinResponseReceivedState = new SpinResponseReceivedStateCommand();
