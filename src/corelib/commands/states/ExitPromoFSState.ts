import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class ExitPromoFSStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    appModel.promoFSTriggered = false;
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    EventHandler.dispatchEvent(SlotEvents.ADD_BUTTONS_FOR_PROMO_SPIN);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    StateManager.goToState(STATES.IDLE_STATE);
  }
}

export const ExitPromoFSState = new ExitPromoFSStateCommand();
