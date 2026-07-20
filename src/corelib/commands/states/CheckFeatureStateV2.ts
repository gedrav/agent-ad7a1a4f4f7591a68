import { appModel } from '@core/models/services/AppModelService';
import { StateCommand } from '../core/StateCommand';
import { StateManager } from '@core/states/StateManagerService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { STATES } from '@core/states/StateConstants';
import { GAMESTATES } from '@slots/meowmeowmeow/states/GameStates';

class CheckFeatureStateV2Command extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsFeatureTriggered() && appModel.getNextFeatureType()) {
      if (appModel.secondaryAssetsLoaded) {
        const fType = appModel.getNextFeatureType();
        if (fType === CONSTANTS.FEATURE_TYPE_FREESPIN) {
          if (appModel.getIsFreeSpinsSession()) {
            StateManager.goToState(STATES.CHECK_FS_STATE);
          } else {
            StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
          }
        } else if (fType === CONSTANTS.FEATURE_TYPE_PICK) {
          StateManager.goToState(STATES.ENTER_PICK_FEATURE_STATE);
        } else {
          console.log('New Feature Typen:', fType, 'not handled yet, going to game feature state');
          StateManager.goToState(STATES.GAME_FEATURE_STATE);
        }
      } else {
        appModel.waitingForFeature = true;
        EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
      }
    } else if (appModel.getIsFreeSpinsSession()) {
      StateManager.goToState(STATES.CHECK_FS_STATE);
    } else {
      StateManager.next();
    }
  }
}

export const CheckFeatureStateV2 = new CheckFeatureStateV2Command();
