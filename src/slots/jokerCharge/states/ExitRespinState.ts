import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { JCEvents } from '../events/JCEvents';

class ExitRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    // Mirrors EnterRespinState - the wipe hides the swap back, which also clears respinActive so
    // the next settle takes the normal pipeline instead of CheckRespinState.
    EventHandler.dispatchEvent(JCEvents.PLAY_TRANSITION, {
      onHalfway: () => {
        EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, { active: false });
        EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
        // The last round left the stop-spin button up: respin rounds route out of
        // JCSpinResponseReceivedState before it can restore the spin face.
        EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_BUTTON);
        EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
        StateManager.next();
      },
    });
  }
}

export const ExitRespinState = new ExitRespinStateCommand();
