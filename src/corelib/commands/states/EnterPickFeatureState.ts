import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateCommand } from '../core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { State } from 'pixi.js';
import { STATES } from '@core/states/StateConstants';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class EnterPickFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getNextFeatureType() !== CONSTANTS.FEATURE_TYPE_PICK) {
      StateManager.goToState(STATES.COMPLETE_GAMEROUND_STATE);
      return;
    }
    this.doNextStep(data);
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_ENTRY_SOUND);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    appModel.startPickFeatureSession();
    appModel.setFeatureTriggered();

    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    const subFeatureName = appModel.getNextSubFeatureType()
      ? appModel.getNextSubFeatureType()
      : appModel.getUnfinishedFeatureSubType();
    obj.message1 = Util.parseMessage(Util.getContent('PickFeatureEntryText'), [subFeatureName]);
    obj.entryPopUp = true;

    obj.callbackFunction = this.enterPickFeature.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP, obj);
  }

  protected async enterPickFeature() {
    WrapperProxy.postLifecycleEvent('GameBusy', { reason: 'bonus' });
    EventHandler.dispatchEvent(SlotEvents.HIDE_MAINGAME_ELEMENTS);
    // Add event listner at the game level to create pickFeature UI
    EventHandler.dispatchEvent(SlotEvents.PICKFEATURE_UPDATE_UI_START);
    EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_BG_SOUND);
    StateManager.next();
  }
}

export const EnterPickFeatureState = new EnterPickFeatureStateCommand();
