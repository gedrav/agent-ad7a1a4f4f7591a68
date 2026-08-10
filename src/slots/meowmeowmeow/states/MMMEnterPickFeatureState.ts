import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';

class MMMEnterPickFeatureStateCommand extends StateCommand {
  private enteredFromBlue: boolean = false;

  public async execute(data?: any): Promise<void> {
    super.execute(data);
    if (appModel.subFeatureAwardAnnounced) {
      StateManager.doNextStep();
      return;
    }
    EventHandler.dispatchEvent('SHOW_KITTIEBANK_BREAK');
  }

  public doNextStep(data?: any): void {
    super.doNextStep(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_ENTRY_SOUND);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    appModel.startPickFeatureSession();
    appModel.setFeatureTriggered();

    this.enteredFromBlue = appModel.subFeatureAwardAnnounced;

    if (this.enteredFromBlue) {
      this.enterPickFeature();
      return;
    }

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
    EventHandler.dispatchEvent(SlotEvents.HIDE_MAINGAME_ELEMENTS);
    // Add event listner at the game level to create pickFeature UI
    EventHandler.dispatchEvent(SlotEvents.PICKFEATURE_UPDATE_UI_START);
    EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_BG_SOUND);
    StateManager.next();
  }
}

export const MMMEnterPickFeatureState = new MMMEnterPickFeatureStateCommand();
