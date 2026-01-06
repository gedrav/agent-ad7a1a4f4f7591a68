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
    EventHandler.dispatchEvent(SlotEvents.FREESPINS_UPDATE_UI_END);
    const fswin = appModel.getTotalFreespinWinAmount();
    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    obj.message1 = Util.parseMessage(Util.getContent('FSExitText'), [
      Util.formatCurrency(appModel.getTotalFreespinWinAmount()),
    ]);
    if (appModel.getIsMaxCapReached()) {
      obj.message1 = Util.parseMessage(Util.getContent('FSExitTextForMaxCapReached'), [
        Util.formatCurrency(appModel.getTotalFreespinWinAmount()),
      ]);
    }
    obj.callbackFunction = this.exitFreespin.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
    EventHandler.dispatchEvent(SlotEvents.SET_MG_MULTIPLIERS_VISIBLITY, true);
    EventHandler.dispatchEvent(SlotEvents.SET_FS_MULTIPLIERS_VISIBLITY, false);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER);
  }
  protected async exitFreespin() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MAINGAME_BG);
    // Update balance with final free spin wins
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    appModel.endFreeSpinsSession();
    StateManager.goToState(STATES.IDLE_STATE);
  }
}

export const ExitFreespinsState = new ExitFreespinsStateCommand();
