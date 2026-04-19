import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';

class StopClickCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.DISABLE_STOPSPIN_BUTTON);
    EventHandler.dispatchEvent(SlotEvents.QUICK_STOP_SPIN);
  }
}

export const StopClickCommand = new StopClickCmd();
