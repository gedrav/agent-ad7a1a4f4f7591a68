import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class AutoPlayConfirmBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CONFIRM_BTN_CLICKED);
  }
}

export const AutoPlayConfirmBtnCommand = new AutoPlayConfirmBtnCmd();
