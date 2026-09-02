import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';

class GreenEnterFreespinsStateCommand extends StateCommand {
  private enteredFromBlue: boolean = false;

  public async execute(data: any = null) {
    super.execute(data);
    if (GameProxy.config.subFeatureAwardAnnounced) {
      StateManager.doNextStep();
      return;
    }
    if (appModel.getFeatureTriggerPositions() && appModel.getFeatureTriggerPositions().length > 0) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_SCATTER_TRIGGER);
    } else {
      // this is due to kittie bank break
      EventHandler.dispatchEvent('SHOW_GREEN_KITTIEBANK_BREAK');
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_ENTRY_POPUP_SOUND);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_FS_TOTALWIN);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    appModel.startFreeSpinsSession(true);
    appModel.setFeatureTriggered();

    this.enteredFromBlue =
      GameProxy.config.subFeatureAwardAnnounced || appModel.getFeatureSubType()?.toUpperCase() === FEATURE_NAMES.BLUE;

    if (this.enteredFromBlue) {
      const skipBgStop = GameProxy.config.subFeatureAwardAnnounced;
      appModel.fsInfo = {
        ...appModel.fsInfo,
        currentFreespin: 0,
        totalFreespins: appModel.featureResult?.featureData?.initialSpinCount,
      };
      EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, false);
      EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, true);
      EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
      EventHandler.dispatchEvent('SET_KITTIBANK_FEATURE_STATE', FEATURE_NAMES.GREEN);
      this.enterFreespin(!skipBgStop);
      return;
    }

    // reload blue→green: skip popup here, GreenEnterTransitionState handles it
    const isReloadBlueToGreen =
      appModel.getIsUnfinishedFreespins() && appModel.getFeatureSubType()?.toUpperCase() === FEATURE_NAMES.GREEN;

    EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, false);
    EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, true);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
    EventHandler.dispatchEvent('SET_KITTIBANK_FEATURE_STATE', FEATURE_NAMES.GREEN);

    if (isReloadBlueToGreen) {
      this.enterFreespin(true);
      return;
    }

    const obj: any = {};
    obj.title = Util.getContent('FeatureAwardedTitle');

    const isUnfinishedFreespins = appModel.getIsUnfinishedFreespins();

    obj.message1 = '';
    obj.entryPopUp = true;

    const totalCount = appModel.getTotalFreespins();
    const remainingCount = totalCount - appModel.getCurrentFreeSpin() + 1;

    if (isUnfinishedFreespins && remainingCount !== totalCount) {
      obj.message2 = Util.parseMessage(Util.getContent('FSRemainingText'), [remainingCount]);
    }

    obj.totalCount = totalCount;
    obj.triggeredByScatter = !!(
      appModel.getFeatureTriggerPositions() && appModel.getFeatureTriggerPositions().length > 0
    );
    obj.callbackFunction = this.enterFreespin.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
  }

  protected async enterFreespin(stopBgSound: boolean = true) {
    EventHandler.dispatchEvent(SlotEvents.HIDE_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FREEGAME_BG);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_START);
    if (stopBgSound) {
      EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    }

    StateManager.next();
  }
}

export const GreenEnterFreespinsState = new GreenEnterFreespinsStateCommand();
