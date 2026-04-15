import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { ShowLowBalanceErrorCommand } from '@core/commands/action/ShowLowBalanceErrorCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { RequestFullscreenCommand } from './RequestFullscreenCommand';

class SpinClickCmd extends ActionCommand {
  public async execute(data: any = null) {
    super.execute(data);

    if (appModel.getIsSpinStartPossible()) {
      EventHandler.dispatchEvent('SPIN_CLICKED');
      StateManager.goToState(STATES.SPIN_START_STATE);
      const isDesktop = DeviceProxy.config.isDesktop;
      const isTablet = DeviceProxy.config.isTablet;
      // Request fullscreen on desktop on first spin
      if (!isDesktop && !isTablet) {
        RequestFullscreenCommand.execute();
      }
    } else {
      const action: ActionCommand = ShowLowBalanceErrorCommand;
      action?.execute(null, this);
    }
  }
}

export const SpinClickCommand = new SpinClickCmd();
