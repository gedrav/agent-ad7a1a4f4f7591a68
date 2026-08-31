import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class CheckPromoFSStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsPromoFSSession()) {
      if (appModel.getIsNextPromoSpinPossible()) {
        EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
        StateManager.goToState(STATES.RESUME_PROMOFS_STATE);
      } else {
        this.endPromoFS();
      }
    } else {
      StateManager.goToState(STATES.CHECK_AUTOSPIN_STATE);
    }
  }
  protected endPromoFS() {
    appModel.endPromoFSBet();
    EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PROMO_SPIN_EXIT_POPUP);
  }
  public doNextStep(data?: any): void {
    super.doNextStep(data);
    StateManager.goToState(STATES.EXIT_PROMOFS_STATE);
  }
}

export const CheckPromoFSState = new CheckPromoFSStateCommand();
