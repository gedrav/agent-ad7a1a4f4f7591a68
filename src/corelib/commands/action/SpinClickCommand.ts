import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { ShowLowBalanceErrorCommand } from '@core/commands/action/ShowLowBalanceErrorCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class SpinClickCmd extends ActionCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsSpinStartPossible()) {
      EventHandler.dispatchEvent('SPIN_CLICKED');
      StateManager.goToState(STATES.SPIN_START_STATE);
    } else {
      const action: ActionCommand = ShowLowBalanceErrorCommand;
      action?.execute(null, this);
    }
  }
}

export const SpinClickCommand = new SpinClickCmd();
