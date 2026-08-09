import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class CheckPromoFSTriggerStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.promoSpinInfo) {
      this.showPromoFSPopup();
    } else {
      StateManager.next();
    }
  }
  protected showPromoFSPopup() {
    appModel.setPromoFSBet();
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP);
  }

  public doNextStep(data?: any): void {
    console.log('do next -- ', data);
    super.doNextStep(data);
    if (data) {
      appModel.promoSpinSession = true;
      EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_START);
      EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
      EventHandler.dispatchEvent(SlotEvents.REMOVE_BUTTONS_FOR_PROMO_SPIN);
      StateManager.next();
    } else {
      StateManager.goToState(STATES.IDLE_STATE);
    }
  }
}

export const CheckPromoFSTriggerState = new CheckPromoFSTriggerStateCommand();
