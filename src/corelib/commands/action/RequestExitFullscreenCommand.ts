import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class RequestExitFullscreenCmd extends ActionCommand {
  public execute() {
    super.execute();

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
  }
}

export const RequestExitFullscreenCommand = new RequestExitFullscreenCmd();
