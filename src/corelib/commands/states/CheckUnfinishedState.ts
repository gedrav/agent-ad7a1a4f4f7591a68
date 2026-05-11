import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class CheckUnfinishedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsUnfinishedGame()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
      if (appModel.getIsAnteBetOn()) {
        EventHandler.dispatchEvent(SlotEvents.UPDATE_UNFINISHED_ANTE_BET);
      }
      EventHandler.dispatchEvent(SlotEvents.RENDER_UNFINISHED_REEL);
      if (appModel.getIsFeatureTriggered()) {
        const fType = appModel.getUnfinishedFeatureType();
        if (fType === CONSTANTS.FEATURE_TYPE_FREESPIN) {
          StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
        } else {
          console.log('feature but not FS, handle now');
        }
      } else {
        console.log('Unfinished but no feature data');
      }
    } else {
      StateManager.next();
    }
  }
}

export const CheckUnfinishedState = new CheckUnfinishedStateCommand();
