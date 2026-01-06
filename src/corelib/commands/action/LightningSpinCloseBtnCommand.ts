import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class LightningSpinCloseBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.LIGHTNING_SPIN_CLOSE_BUTTON_CLICKED);
  }
}

export const LightningSpinCloseBtnCommand = new LightningSpinCloseBtnCmd();
