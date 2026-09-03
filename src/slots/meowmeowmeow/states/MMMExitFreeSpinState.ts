import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';
import { GameProxy } from '@core/models/GameConfigProxy';

class MMMExitFreeSpinStateCommand extends StateCommand {
  private maxCapPopupShown = false;

  public async execute(data: any = null) {
    super.execute(data);

    if (appModel.getIsMaxCapReached() && !this.maxCapPopupShown) {
      this.maxCapPopupShown = true;
      const obj: any = {};
      obj.title = Util.getContent('infoText');
      obj.message = Util.parseMessage(Util.getContent('maxCapReachedBaseGame'), [
        Util.formatCurrency(appModel.getTotalFreespinWinAmount()),
      ]);
      // MessagePopupView re-enters CHECK_FS_STATE on close while a freespins session is
      // active, which routes back into this state once free spins are confirmed finished.
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
      return;
    }

    this.maxCapPopupShown = false;
    EventHandler.dispatchEvent('CLOSE_VAULT', this.afterCloseWheelDoor.bind(this));
  }

  private afterCloseWheelDoor(): void {
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_EXIT_POPUP_SOUND);
    if (appModel.getIsAutoSession()) {
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_START);
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_COUNT);
    }

    if (appModel.getIsMaxCapReached()) {
      EventHandler.dispatchEvent('TRANSITION_BACKGROUND', { to: 'BG' });
      EventHandler.dispatchEvent('RESET_KITTIEBANK_ANIM');
      EventHandler.dispatchEvent('TRANSITION', {
        show: true,
        callback: () => {},
      });
      this.finishFreespinExitUI();
      this.exitFreespin();
      return;
    }

    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    obj.message1 = Util.parseMessage(Util.getContent('FSExitText'), [
      Util.formatCurrency(appModel.getTotalFreespinWinAmount()),
    ]);
    obj.entryPopUp = false;
    obj.callbackFunction = this.exitFreespin.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS_FS);

    this.finishFreespinExitUI();
  }

  private finishFreespinExitUI(): void {
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_END_FSCOMP, true);
    EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, true);
    EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, false);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
  }

  protected async exitFreespin() {
    if (GameProxy.config.dontShowWinAfterFS) {
      GameProxy.config.checkToShowWinAfterFS = true;
    }
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_ELEMENTS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_BG);
    // Update total win so Autoplay Winnings shows the correct amount after feature ends.
    if (appModel.gameResult && appModel.featureResult?.totalWin != null) {
      appModel.gameResult.totalWin = appModel.featureResult.totalWin;
    }
    appModel.endFreeSpinsSession();
    appModel.clearUnfinishedData();
    EventHandler.dispatchEvent('STOP_FREESPIN_BG_MUSIC');
    EventHandler.dispatchEvent(SlotEvents.STOP_FS_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_END);
    StateManager.next();
  }
}

export const MMMExitFreeSpinState = new MMMExitFreeSpinStateCommand();
