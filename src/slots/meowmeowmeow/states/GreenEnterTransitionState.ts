import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { MMMExitPickFeatureState } from '@slots/meowmeowmeow/states/MMMExitPickFeatureState';

class GreenEnterTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent('SHOW_GREEN_TRANSITION');
    if (MMMExitPickFeatureState.isSubFeatureAwardAnnounced()) {
      MMMExitPickFeatureState.setSubFeatureAwardAnnounced(false);
      EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP, {
        title: Util.getContent('CongratTitle'),
        message1: Util.parseMessage(Util.getContent('PickFeatureEntryText'), [appModel.getNextSubFeatureType()]),
        entryPopUp: false,
        skipModalDim: true,
        hideFeatureAwardedTitle: true,
        callbackFunction: () => StateManager.doNextStep(),
      });
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GreenEnterTransitionState = new GreenEnterTransitionStateCommand();
