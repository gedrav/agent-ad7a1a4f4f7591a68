import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class LightningSpinBetStakeBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.LIGHTNING_SPIN_BET_STAKE_UPDATE, data);
  }
}

export const LightningSpinBetStakeBtnCommand = new LightningSpinBetStakeBtnCmd();
