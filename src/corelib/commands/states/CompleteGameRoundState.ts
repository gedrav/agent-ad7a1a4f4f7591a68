import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { canShowJackpot, getPostJackpotState } from '@core/commands/states/JackpotFlowHelper';
import { STATES } from '@core/states/StateConstants';
import { AutoStopSpinCommand } from '@core/commands/action/AutoStopSpinCommand';

class CompleteGameRoundStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsFreeSpinsSession()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_FS_TOTALWIN);
    }
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    if (canShowJackpot()) {
      if (appModel.getIsAutoSession()) AutoStopSpinCommand.execute();
      StateManager.goToState(STATES.SHOW_JACKPOT_GAME_STATE);
    } else {
      StateManager.goToState(getPostJackpotState());
    }
  }
}

export const CompleteGameRoundState = new CompleteGameRoundStateCommand();
