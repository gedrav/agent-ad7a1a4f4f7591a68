import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class AutoPlaySliderChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.SLIDER_CHANGE, data);
  }
}

export const AutoPlaySliderChangeCommand = new AutoPlaySliderChangeCmd();
