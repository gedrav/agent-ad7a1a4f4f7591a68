import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

class IncrementDecrementActionBetCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    appModel.incrementDecrementBet(data);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
  }
}

export const IncrementDecrementActionBetCommand = new IncrementDecrementActionBetCmd();
