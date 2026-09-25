import { ExitRespinStateCommand } from '@core/commands/states/ExitRespinState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '../events/JCEvents';

class JCExitRespinStateCommand extends ExitRespinStateCommand {
  // Mirrors EnterRespinState - the wipe hides the swap back, which also clears respinActive so
  // the next settle takes the normal pipeline instead of CheckRespinState.
  protected closeFeature(onSwap: () => void): void {
    EventHandler.dispatchEvent(JCEvents.PLAY_TRANSITION, {
      onHalfway: () => {
        EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, { active: false });
        onSwap();
      },
    });
  }
}

export const ExitRespinState = new JCExitRespinStateCommand();
