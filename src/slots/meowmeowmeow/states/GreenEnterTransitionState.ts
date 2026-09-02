import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';

class GreenEnterTransitionStateCommand extends StateCommand {
  // true only on reload blue→green, so doNextStep opens vault before advancing
  private _pendingVaultForReload = false;

  public async execute(data: any = null) {
    super.execute(data);
    if (GameProxy.config.subFeatureAwardAnnounced) {
      // live blue→green: show popup; onCloseClicked handles vault animation
      GameProxy.config.subFeatureAwardAnnounced = false;
      EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, {
        title: Util.getContent('FeatureAwardedTitle'),
        message1: '',
        entryPopUp: true,
        totalCount: appModel.getTotalFreespins(),
        callbackFunction: () => StateManager.doNextStep(),
      });
    } else if (appModel.getIsUnfinishedFreespins()) {
      this._pendingVaultForReload = true;
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, {
        title: Util.getContent('FeatureAwardedTitle'),
        message1: '',
        entryPopUp: true,
        totalCount: appModel.getTotalFreespins(),
        callbackFunction: () => StateManager.doNextStep(),
      });
    } else {
      this._pendingVaultForReload = false;
      EventHandler.dispatchEvent('SHOW_GREEN_TRANSITION');
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    if (this._pendingVaultForReload) {
      this._pendingVaultForReload = false;
      EventHandler.dispatchEvent('SHOW_GREEN_TRANSITION');
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_BG_SOUND);
    StateManager.next();
  }
}

export const GreenEnterTransitionState = new GreenEnterTransitionStateCommand();
