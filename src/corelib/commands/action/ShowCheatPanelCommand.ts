import { ActionCommand } from '@core/commands/core/ActionCommand';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

class ShowCheatPanelCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    const isDesktop = DeviceProxy.config.isDesktop;
    (window as any).cheatBtnClicked?.(isDesktop);
    (window as any).fetchCheatDetails?.();
  }
}

export const ShowCheatPanelCommand = new ShowCheatPanelCmd();
