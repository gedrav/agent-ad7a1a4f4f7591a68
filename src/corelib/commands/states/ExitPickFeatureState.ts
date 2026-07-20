import { StateCommand } from '../core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { State } from 'pixi.js';
import { STATES } from '@core/states/StateConstants';

class ExitPickFeatureStateCommand extends StateCommand {
  public async execute(data?: any): Promise<void> {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PF_EXIT_POPUP_SOUND);
    EventHandler.dispatchEvent(SlotEvents.HIDE_PICK_FEATURE_UI);

    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    obj.message1 = Util.parseMessage(Util.getContent('PickFeatureExitText'), [
      //TODO:  Update fn to get total wins for the feature
      Util.formatCurrency(10000),
    ]);
    obj.entryPopUp = false;
    obj.callbackFunction = this.exitPickFeature.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP, obj);
  }

  protected async exitPickFeature() {
    appModel.endPickFeatureSession();
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_BG);
    appModel.endPickFeatureSession();
    appModel.clearUnfinishedData();
    EventHandler.dispatchEvent(SlotEvents.STOP_PICK_FEATURE_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    StateManager.goToState(STATES.CHECK_FEATURE_STATE_V2);
  }
}

export const ExitPickFeatureState = new ExitPickFeatureStateCommand();
