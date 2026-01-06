import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class AutoPlayNoOfSpinsBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    const value = typeof data === 'object' && data?.value !== undefined ? data.value : data;
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_NO_OF_SPIN_BTN_CLICKED, value);
  }
}

export const AutoPlayNoOfSpinsBtnCommand = new AutoPlayNoOfSpinsBtnCmd();
