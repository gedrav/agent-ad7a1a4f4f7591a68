import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class AutoPlayCancelBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CANCEL_CLICKED);
  }
}

export const AutoPlayCancelBtnCommand = new AutoPlayCancelBtnCmd();
