import { ActionCommand } from '@core/commands/core/ActionCommand';

class RefreshGameCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    window.close();
  }
}

export const RefreshGameCommand = new RefreshGameCmd();
