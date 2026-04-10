import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { ShowLowBalanceErrorCommand } from '@core/commands/action/ShowLowBalanceErrorCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { RequestFullscreenCommand } from './RequestFullscreenCommand';

class SpinClickCmd extends ActionCommand {
  private static isSpinning = false;

  public async execute(data: any = null) {
    super.execute(data);

    // Guard against multiple rapid clicks
    if (SpinClickCmd.isSpinning) return;

    if (appModel.getIsSpinStartPossible()) {
      SpinClickCmd.isSpinning = true;
      try {
        EventHandler.dispatchEvent('SPIN_CLICKED');
        StateManager.goToState(STATES.SPIN_START_STATE);
        if (appModel.turboMode) {
          EventHandler.dispatchEvent('TURBO_START_SLOT_SPIN');
        } else {
          EventHandler.dispatchEvent('START_SLOT_SPIN');
        }
        const isDesktop = DeviceProxy.config.isDesktop;
        const isTablet = DeviceProxy.config.isTablet;
        // Request fullscreen on desktop on first spin
        if (!isDesktop && !isTablet) {
          RequestFullscreenCommand.execute();
        }
      } finally {
        // Reset after minimum spin duration
        setTimeout(() => {
          SpinClickCmd.isSpinning = false;
        }, 500);
      }
    } else {
      const action: ActionCommand = ShowLowBalanceErrorCommand;
      action?.execute(null, this);
    }
  }
}

export const SpinClickCommand = new SpinClickCmd();
