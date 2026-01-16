import { ActionCommand } from '@core/commands/core/ActionCommand';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { GameProxy } from '@core/models/GameConfigProxy';

class ShowCheatPanelCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    GameProxy.config.exterPageOpened = true;
    const isDesktop = DeviceProxy.config.isDesktop;
    (window as any).cheatBtnClicked?.(isDesktop);
    (window as any).fetchCheatDetails?.();
  }
}

export const ShowCheatPanelCommand = new ShowCheatPanelCmd();
