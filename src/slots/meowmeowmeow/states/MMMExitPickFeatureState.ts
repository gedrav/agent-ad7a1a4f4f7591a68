import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';

class MMMExitPickFeatureStateCommand extends StateCommand {
  public async execute(data?: any): Promise<void> {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PF_EXIT_POPUP_SOUND);
    EventHandler.dispatchEvent(SlotEvents.HIDE_PICK_FEATURE_UI);
    EventHandler.dispatchEvent('RESET_PICK_BONUS');
    EventHandler.dispatchEvent('CLOSE_VAULT', this.afterHidePickFeatureUI.bind(this));
  }

  private afterHidePickFeatureUI(): void {
    if (this.checkForMaxCapWin()) {
      EventHandler.dispatchEvent('TRANSITION_BACKGROUND', { to: 'BG' });
      // EventHandler.dispatchEvent('TRANSITION', {
      //   show: true,
      //   callback: () => { },
      // });
      // return;
    }

    const awardedFromBlueWheel =
      appModel.getFeatureSubType()?.toUpperCase() === FEATURE_NAMES.BLUE && !!appModel.getNextSubFeatureType();

    if (awardedFromBlueWheel) {
      GameProxy.config.subFeatureAwardAnnounced = true;
      this.exitPickFeature();
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

  protected checkForMaxCapWin(): boolean {
    if (!appModel.getIsMaxCapReached()) {
      return false;
    }

    const obj: any = {};
    obj.title = Util.getContent('infoText');
    obj.message = Util.parseMessage(Util.getContent('maxCapReachedBaseGame'), [
      Util.formatCurrency(appModel.featureResult.totalWin),
    ]);
    obj.callback = this.exitPickFeature.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
    return true;
  }

  protected goToNextStep(): void {
    StateManager.next();
  }

  protected async exitPickFeature() {
    appModel.endPickFeatureSession();
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_BG);
    appModel.endPickFeatureSession();
    appModel.clearUnfinishedData();
    EventHandler.dispatchEvent(SlotEvents.STOP_PICK_FEATURE_BG_SOUND);
    EventHandler.dispatchEvent('STOP_BLUE_WHEEL_BG_SOUND');
    EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    StateManager.goToState(STATES.CHECK_FEATURE_STATE_V2);
  }
}

export const MMMExitPickFeatureState = new MMMExitPickFeatureStateCommand();
