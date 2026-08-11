import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';

class PickFeatureTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent('SHOW_PICK_FEATURE_TRANSITION');
    if (appModel.subFeatureAwardAnnounced) {
      appModel.subFeatureAwardAnnounced = false;
      // Show the same entry popup a directly-triggered Red/Green entry would show,
      // instead of a separate "blue exit" style popup.
      EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP, {
        title: Util.getContent('CongratTitle'),
        message1: Util.parseMessage(Util.getContent('PickFeatureEntryText'), [appModel.getNextSubFeatureType()]),
        entryPopUp: true,
        callbackFunction: () => StateManager.doNextStep(),
      });
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const PickFeatureTransitionState = new PickFeatureTransitionStateCommand();
