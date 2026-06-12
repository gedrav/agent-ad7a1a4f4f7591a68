import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class ExitFreespinsStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_EXIT_POPUP_SOUND);
    if (appModel.getIsAutoSession()) {
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_START);
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_COUNT);
    }

    if (appModel.getIsMaxCapReached()) {
      const obj: any = {};
      obj.title = Util.getContent('infoText');
      obj.message = Util.parseMessage(Util.getContent('maxCapReachedBaseGame'), [
        Util.formatCurrency(appModel.getTotalFreespinWinAmount()),
      ]);
      obj.callback = this.exitFreespin.bind(this);
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
    } else {
      const obj: any = {};
      obj.title = Util.getContent('CongratTitle');
      obj.message1 = Util.parseMessage(Util.getContent('FSExitText'), [
        Util.formatCurrency(appModel.getTotalFreespinWinAmount()),
      ]);
      obj.callbackFunction = this.exitFreespin.bind(this);
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS_FS);
    }

    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_END_FSCOMP, true);
    EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, true);
    EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, false);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
  }
  protected async exitFreespin() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_BG);
    // Update balance with final free spin wins
    appModel.endFreeSpinsSession();
    EventHandler.dispatchEvent('STOP_FREESPIN_BG_MUSIC');
    EventHandler.dispatchEvent(SlotEvents.STOP_FS_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_END);
    StateManager.goToState(STATES.COMPLETE_GAMEROUND_STATE);
  }
}

export const ExitFreespinsState = new ExitFreespinsStateCommand();
