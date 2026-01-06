import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class LightningSpinRoundsChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.LIGHTNING_SPIN_ROUNDS_CHANGE_UPDATE, data);
  }
}

export const LightningSpinRoundsChangeCommand = new LightningSpinRoundsChangeCmd();
