import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class EnterFreespinsStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.SHOW_SCATTER_TRIGGER);
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_ENTRY_POPUP_SOUND);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_FS_TOTALWIN);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    appModel.startFreeSpinsSession(true);
    appModel.setFeatureTriggered();
    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');

    const isUnfinishedFreespins = appModel.getIsUnfinishedFreespins();

    obj.message1 = Util.parseMessage(Util.getContent('FSEntryText'), [appModel.getTotalFreespins()]);
    obj.entryPopUp = true;

    const totalCount = appModel.getTotalFreespins();
    const remainingCount = totalCount - appModel.getCurrentFreeSpin() + 1;

    if (isUnfinishedFreespins && remainingCount !== totalCount) {
      obj.message2 = Util.parseMessage(Util.getContent('FSRemainingText'), [remainingCount]);
    }

    obj.callbackFunction = this.enterFreespin.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
    EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, false);
    EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, true);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
  }
  protected async enterFreespin() {
    EventHandler.dispatchEvent(SlotEvents.HIDE_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FREEGAME_BG);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_START);
    EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_BG_SOUND);

    StateManager.next();
  }
}

export const EnterFreespinsState = new EnterFreespinsStateCommand();
