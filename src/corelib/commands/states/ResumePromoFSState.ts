import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class ResumePromoFSStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    // if (appModel.getIsPromoFSSession()) {
    //   EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
    //   StateManager.goToState(STATES.SPIN_START_STATE);
    // }
  }
}

export const ResumePromoFSState = new ResumePromoFSStateCommand();
