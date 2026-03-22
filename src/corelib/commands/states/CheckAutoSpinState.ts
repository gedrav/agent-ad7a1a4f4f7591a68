import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';

class CheckAutoSpinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsAutoSession()) {
      appModel.incrementAutoSpin();
      appModel.setAutoPlayWin(appModel.getTotalBaseWin());
      const status = appModel.getNextAutoPossible();
      if (status === 1 && appModel.getIsSpinStartPossible()) {
        setTimeout(() => StateManager.goToState('SPIN_START_STATE'), 250);
      } else {
        appModel.resetAutoplayData();
        EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_ENDED);
        StateManager.goToState('IDLE_STATE');
        const obj: any = {};
        obj.title = Util.getContent('infoText');
        obj.message = Util.getContent('AutoplayCompleted');
        EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
      }
    } else {
      StateManager.goToState('IDLE_STATE');
    }
  }
}

export const CheckAutoSpinState = new CheckAutoSpinStateCommand();
