import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { StateManager } from '@core/states/StateManagerService';
import { canShowJackpot } from '@core/commands/states/JackpotFlowHelper';
import { STATES } from '@core/states/StateConstants';

class CheckUnfinishedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.jackpotRound?.status === 'PENDING' && canShowJackpot()) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_JACKPOT_FINAL_VALUE);
      appModel.freezeJackpotMeters();
      StateManager.goToState(STATES.SHOW_JACKPOT_GAME_STATE);
    } else if (appModel.getIsUnfinishedGame()) {
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
          } else {
            console.log('feature but not FS, handle now');
            StateManager.goToState(STATES.GAME_FEATURE_STATE);
          }
        } else {
          appModel.waitingForFeature = true;
          EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
        }
      } else {
        console.log('Unfinished but no feature data');
      }
    } else if (appModel.getIsPromoFSSession()) {
      StateManager.goToState(STATES.RESUME_PROMOFS_STATE);
    } else {
      StateManager.next();
    }
  }
}

export const CheckUnfinishedState = new CheckUnfinishedStateCommand();
