import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { STATES } from '@core/states/StateConstants';

class CheckLightningSpinStateCmd extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsLightningSession()) {
      if (appModel.getRemainingLightningSpin() > 0 && appModel.getIsSpinStartPossible()) {
        appModel.incrementLightningSpin();
        StateManager.goToState(STATES.LIGHTNING_SPIN_START_STATE);
      } else {
        StateManager.goToState('IDLE_STATE');
        EventHandler.dispatchEvent(SlotEvents.ENABLE_LIGHTNING_COMP);

        // const obj: any = {};
        // obj.title = Util.getContent('infoText');
        // obj.message = Util.getContent('AutoplayCompleted');
        // EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
      }
    } else {
      StateManager.goToState('IDLE_STATE');
    }
  }
}

export const CheckLightningSpinState = new CheckLightningSpinStateCmd();
