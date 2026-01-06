import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class ErrorMessageCloseCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.CLOSE_MESSAGE_POPUP);
    EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
  }
}

export const ErrorMessageCloseCommand = new ErrorMessageCloseCmd();
