import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

class CheckAutoSpinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const remainingTime = appModel.getSpinRemainingTime();
    if (appModel.getIsAutoSession()) {
      appModel.incrementAutoSpin();
      appModel.setAutoPlayWin(appModel.getTotalBaseWin());
      const status = appModel.getNextAutoPossible();
      if (status === 1 && appModel.getIsSpinStartPossible()) {
        setTimeout(() => StateManager.goToState('SPIN_START_STATE'), Math.max(remainingTime, 250));
      } else {
        appModel.resetAutoplayData();
        EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_STOP);
        StateManager.goToState('IDLE_STATE');
        /*const obj: any = {};
        obj.title = Util.getContent('infoText');
        obj.message = Util.getContent('AutoplayCompleted');
        EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);*/
      }
    } else {
      if (GameProxy.config.isAutoStopped) {
        EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_STOP);
        GameProxy.config.isAutoStopped = false;
      }
      StateManager.goToState('IDLE_STATE');
    }
  }
}

export const CheckAutoSpinState = new CheckAutoSpinStateCommand();
