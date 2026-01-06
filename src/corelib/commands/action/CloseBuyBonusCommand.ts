import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class CloseBuyBonusCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.HIDE_BUY_BONUS_VIEW);
  }
}

export const CloseBuyBonusCommand = new CloseBuyBonusCmd();
