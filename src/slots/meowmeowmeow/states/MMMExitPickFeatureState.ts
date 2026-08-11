import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class MMMExitPickFeatureStateCommand extends StateCommand {
  public async execute(data?: any): Promise<void> {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PF_EXIT_POPUP_SOUND);
    EventHandler.dispatchEvent(SlotEvents.HIDE_PICK_FEATURE_UI);

    const awardedFromBlueWheel =
      appModel.getFeatureSubType()?.toUpperCase() === 'BLUE' && !!appModel.getNextSubFeatureType();

    if (awardedFromBlueWheel) {
      // The award announcement is shown within the transition instead of blocking here.
      GameProxy.config.subFeatureAwardAnnounced = true;
      this.exitPickFeature();
      return;
    }

    if (!appModel.getNextSubFeatureType() && this.isBigWin()) {
      EventHandler.dispatchEvent('SHOW_FEATURE_WIN_ANIM', { callback: this.exitPickFeature.bind(this) });
      return;
    }

    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    if (appModel.getNextSubFeatureType()) {
      obj.message1 = Util.parseMessage(Util.getContent('PickFeatureEntryText'), [appModel.getNextSubFeatureType()]);
    } else {
      const amountText = Util.formatCurrency(appModel.getPickFeatureWinnings());
      obj.message1 = Util.parseMessage(Util.getContent('PickFeatureExitText'), [
        amountText.charAt(0) + ' ' + amountText.slice(1),
      ]);
    }
    obj.entryPopUp = false;
    obj.callbackFunction = this.exitPickFeature.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP, obj);
  }

  private isBigWin(): boolean {
    const bigWinMultiplier = GameProxy.config.bigWinValues?.[0];
    if (!bigWinMultiplier) return false;

    const win = appModel.featureResult?.totalWin ?? 0;
    return win >= appModel.getTotalBet() * bigWinMultiplier;
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

export const MMMExitPickFeatureState = new MMMExitPickFeatureStateCommand();
