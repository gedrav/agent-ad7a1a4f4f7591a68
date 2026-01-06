import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { MessageProxy } from '@core/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';
import { Clock } from '@core/utils/Clock';

class FSSpinStartStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_ROUND);
    EventHandler.dispatchEvent(SlotEvents.START_SPIN);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_COUNT);

    await MessageProxy.requestBonusData(appModel.getFeatureName());
    if (!appModel.isErrorOccurred) {
      StateManager.goToState(STATES.SPIN_RESPONSE_RECEIVED_STATE);
    } else {
      EventHandler.dispatchEvent(SlotEvents.RESET_REEL_FOR_ERROR);
    }
  }
}

export const FSSpinStartState = new FSSpinStartStateCommand();
