import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { GameProxy } from '@core/models/GameConfigProxy';

class PigExitFreespinsStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_EXIT_POPUP_SOUND);

    if (appModel.getIsAutoSession()) {
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_START);
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_COUNT);
    }

    EventHandler.dispatchEvent(SlotEvents.CLEAR_REELWIN_TICKER);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS_FS);

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
      obj.entryPopUp = false;
      obj.callbackFunction = this.exitFreespin.bind(this);
      EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
    }

    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
  }

  protected async exitFreespin() {
    if (GameProxy.config.dontShowWinAfterFS) {
      GameProxy.config.checkToShowWinAfterFS = true;
    }

    appModel.endFreeSpinsSession();
    appModel.clearUnfinishedData();

    EventHandler.dispatchEvent('STOP_FREESPIN_BG_MUSIC');
    EventHandler.dispatchEvent(SlotEvents.STOP_FS_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_END_FSCOMP, true);

    if (appModel.getTotalFreespinWinAmount() > 0 && !appModel.getIsAutoSession()) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
        value: appModel.getTotalFreespinWinAmount(),
        duration: 0,
        toShowTotalWin: true,
      });
    }

    StateManager.next();
  }
}

export const PigExitFreespinsState = new PigExitFreespinsStateCommand();
