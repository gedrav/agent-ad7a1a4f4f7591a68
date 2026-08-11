import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';

class GreenEnterTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent('SHOW_GREEN_TRANSITION');
    if (appModel.subFeatureAwardAnnounced) {
      appModel.subFeatureAwardAnnounced = false;
      // Show the same entry popup a directly-triggered Green entry would show,
      // instead of a separate "blue exit" style popup.
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, {
        title: Util.getContent('FeatureAwardedTitle'),
        message1: '',
        entryPopUp: true,
        totalCount: appModel.getTotalFreespins(),
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
