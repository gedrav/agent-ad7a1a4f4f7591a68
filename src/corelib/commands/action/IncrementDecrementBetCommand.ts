import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

class IncrementDecrementBetCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    appModel.incrementDecrementBet(data);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET, data.value);
  }
}

export const IncrementDecrementBetCommand = new IncrementDecrementBetCmd();
