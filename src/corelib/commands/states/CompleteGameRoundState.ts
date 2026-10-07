import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { STATES } from '@core/states/StateConstants';

class CompleteGameRoundStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsFreeSpinsSession()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_FS_TOTALWIN);
    }
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    if (appModel.jackpotPending) {
      StateManager.goToState(STATES.SHOW_JACKPOT_GAME_STATE);
    } else if (appModel.getIsPromoFSSession()) {
      StateManager.goToState(STATES.CHECK_PROMOFS_STATE);
    } else {
      StateManager.goToState(STATES.CHECK_AUTOSPIN_STATE);
    }
  }
}

export const CompleteGameRoundState = new CompleteGameRoundStateCommand();
