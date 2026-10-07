import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';
import { ActionCommand } from '@core/commands/core/ActionCommand';
import { ShowLowBalanceErrorCommand } from '@core/commands/action/ShowLowBalanceErrorCommand';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class StartAutoSpinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.jackpotPending) return;
    if (appModel.getIsSpinStartPossible()) {
      WrapperProxy.postLifecycleEvent('GameBusy', { reason: 'autoplay' });
      appModel.setAutoplayInfo(data);
      appModel.incrementAutoSpin();
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_START);
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_COUNT);
      StateManager.goToState(STATES.SPIN_START_STATE);
    } else {
      // show low balance error
      const action: ActionCommand = ShowLowBalanceErrorCommand;
      action?.execute(null, this);
    }
  }
}

export const StartAutoSpinState = new StartAutoSpinStateCommand();
