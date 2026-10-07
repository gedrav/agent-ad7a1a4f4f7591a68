import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { StateCommand } from '../core/StateCommand';
import { GAMESTATES } from '@slots/meowmeowmeow/states/GameStates';
import { State } from 'pixi.js';

class CheckUnfinishedStateCommandV2 extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.jackpotRound?.status === 'PENDING') {
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
          } else if (fType === CONSTANTS.FEATURE_TYPE_PICK) {
            StateManager.goToState(STATES.ENTER_PICK_FEATURE_STATE);
          } else if (fType === CONSTANTS.FEATURE_TYPE_RESPIN) {
            StateManager.goToState(STATES.ENTER_RESPIN_STATE);
          } else {
            console.log('New Feature Typen:', fType, 'not handled yet, going to game feature state');
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

export const CheckUnfinishedStateV2 = new CheckUnfinishedStateCommandV2();
