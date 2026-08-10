import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class MMMExitPickFeatureStateCommand extends StateCommand {
  private subFeatureAwardAnnounced: boolean = false;

  public isSubFeatureAwardAnnounced(): boolean {
    return this.subFeatureAwardAnnounced;
  }

  public setSubFeatureAwardAnnounced(announced: boolean): void {
    this.subFeatureAwardAnnounced = announced;
  }

  public async execute(data?: any): Promise<void> {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PF_EXIT_POPUP_SOUND);
    EventHandler.dispatchEvent(SlotEvents.HIDE_PICK_FEATURE_UI);

    // Only the Blue wheel awarding a Red/Green feature defers its announcement to the
    // transition. Every other pick-feature exit keeps its original popup behavior.
    const awardedFromBlueWheel =
      appModel.getFeatureSubType()?.toUpperCase() === 'BLUE' && !!appModel.getNextSubFeatureType();

    if (awardedFromBlueWheel) {
      // The award announcement is shown within the transition instead of blocking here.
      this.setSubFeatureAwardAnnounced(true);
      this.exitPickFeature();
      return;
    }

    // Original exit behavior, unchanged, for every non-Blue-wheel case (Red / Green / etc.).
    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    if (appModel.getNextSubFeatureType()) {
      obj.message1 = Util.parseMessage(Util.getContent('PickFeatureEntryText'), [appModel.getNextSubFeatureType()]);
    } else {
      obj.message1 = Util.parseMessage(Util.getContent('PickFeatureExitText'), [
        Util.formatCurrency(appModel.getPickFeatureWinnings()),
      ]);
    }
    obj.entryPopUp = false;
    obj.callbackFunction = this.exitPickFeature.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_POPUP, obj);
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
