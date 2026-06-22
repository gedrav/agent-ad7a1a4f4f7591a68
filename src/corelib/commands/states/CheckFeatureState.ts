import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class CheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsFeatureTriggered()) {
      if (appModel.secondaryAssetsLoaded) {
        if (appModel.getIsFreeSpinsSession()) {
          StateManager.goToState(STATES.CHECK_FS_STATE);
        } else if (appModel.getIsFSTriggered()) {
          StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
        } else {
          console.log('feature but not FS, handle');
        }
      } else {
        appModel.waitingForFeature = true;
        EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
      }
    } else {
      StateManager.next();
    }
  }
}

export const CheckFeatureState = new CheckFeatureStateCommand();
