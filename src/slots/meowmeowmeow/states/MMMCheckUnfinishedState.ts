import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GAMESTATES } from './GameStates';

class MMMCheckUnfinishedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsUnfinishedGame()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
      if (appModel.getIsAnteBetOn()) {
        EventHandler.dispatchEvent(SlotEvents.UPDATE_UNFINISHED_ANTE_BET);
      }
      EventHandler.dispatchEvent(SlotEvents.RENDER_UNFINISHED_REEL);
      EventHandler.dispatchEvent(SlotEvents.DISALBE_ANTE_BB_BUTTON);
      if (appModel.getIsFeatureTriggered()) {
        const fType = appModel.getUnfinishedFeatureType();
        if (appModel.secondaryAssetsLoaded) {
          if (fType === CONSTANTS.FEATURE_TYPE_FREESPIN) {
            StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
            // FIXME:
            // } else if (fType.toUpperCase() === 'GREEN') {
            //   StateManager.goToState(GAMESTATES.GREEN_ENTER_FREESPINS_STATE);
            // }else if(fType.toUpperCase() === 'BLUE') {
          } else {
            StateManager.goToState(GAMESTATES.WHEEL_FEATURE_STATE);
            console.log('MMMCheckUnfinishedState: Unknown feature type, handling now');
          }
        } else {
          appModel.waitingForFeature = true;
          EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
        }
      } else {
        console.log('Unfinished but no feature data');
      }
    } else {
      StateManager.next();
    }
  }
}

export const MMMCheckUnfinishedState = new MMMCheckUnfinishedStateCommand();
