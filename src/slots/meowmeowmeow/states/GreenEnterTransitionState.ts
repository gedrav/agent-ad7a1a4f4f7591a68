import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';

class GreenEnterTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const isReloadBlueToGreen =
      appModel.getIsUnfinishedFreespins() && appModel.getFeatureSubType()?.toUpperCase() === FEATURE_NAMES.BLUE;

    if (GameProxy.config.subFeatureAwardAnnounced || isReloadBlueToGreen) {
      GameProxy.config.subFeatureAwardAnnounced = false;
      EventHandler.dispatchEvent(SlotEvents.HIDE_MAINGAME_ELEMENTS);
      EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, {
        title: Util.getContent('FeatureAwardedTitle'),
        message1: '',
        entryPopUp: true,
        totalCount: appModel.getTotalFreespins(),
        callbackFunction: () => StateManager.doNextStep(),
      });
    } else {
      EventHandler.dispatchEvent('SHOW_GREEN_TRANSITION');
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_BG_SOUND);
    StateManager.next();
  }
}

export const GreenEnterTransitionState = new GreenEnterTransitionStateCommand();
