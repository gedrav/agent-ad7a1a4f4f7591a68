import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class IncrementDecrementBetCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET_TEMP, data);
  }
}

export const IncrementDecrementBetCommand = new IncrementDecrementBetCmd();
