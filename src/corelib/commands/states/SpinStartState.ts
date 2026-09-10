import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Clock } from '@core/utils/Clock';
import { STATES } from '@core/states/StateConstants';
import { Util } from '@core/utils/UtilService';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class SpinStartStateCommand extends StateCommand {
  private readonly timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);
    if (!appModel.getIsAutoSession() && !appModel.getIsFreeSpinsSession()) {
      WrapperProxy.postLifecycleEvent('GameBusy', { reason: 'spin' });
    }
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_ROUND);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER); // reset multiplier to lvl1 on each spin
    EventHandler.dispatchEvent(SlotEvents.START_SPIN);
    if (appModel.getIsAutoSession()) {
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_COUNT);
    }
    appModel.spinStartTime = Util.getCurrentTimeInMili();
    appModel.isBusy = true;
    appModel.spinRequestSent = true;
    await MessageProxy.requestSpinResult(false);
    EventHandler.dispatchEvent(SlotEvents.CREATE_FINAL_REEL_SYMBOLS);
    await Clock.wait(250);
    if (!appModel.isErrorOccurred) {
      StateManager.next();
    } else {
      EventHandler.dispatchEvent(SlotEvents.STOP_REEL_FOR_ERROR);
      StateManager.goToState(STATES.IDLE_STATE);
    }
  }
}

export const SpinStartState = new SpinStartStateCommand();
