import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class LightningSpinClickCmd extends ActionCommand {
  public execute(data: any = null, sender?: any): void {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.LIGHTNING_SPIN_START_CONFIRM);
  }
}

export const LightningSpinClickCommand = new LightningSpinClickCmd();
