import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { StateCommand } from '../core/StateCommand';

// Closes the respin feature and hands the base game back.
export class ExitRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    this.closeFeature(() => this.restoreBaseGame());
  }

  // Override to cover the swap back with a transition, calling onSwap at the point it is hidden.
  protected closeFeature(onSwap: () => void): void {
    onSwap();
  }

  // Respin rounds route out of SPIN_RESPONSE_RECEIVED_STATE before it can restore the spin face,
  // so the button is put back here rather than left showing stop-spin.
  protected restoreBaseGame(): void {
    EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_BUTTON);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    StateManager.next();
  }
}

export const ExitRespinState = new ExitRespinStateCommand();
