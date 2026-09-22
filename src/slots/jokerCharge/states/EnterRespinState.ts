import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { Clock } from '@core/utils/Clock';
import { JCEvents } from '../events/JCEvents';

// Lets the triggering win stay readable before the screen wipes over.
const INTRO_DELAY = 3000;

// The feature-type guard is load-bearing: CheckFeatureStateV2's final `else { StateManager.next()
// }` (an ordinary spin, no feature) falls through onto this state, so without it every non-feature
// spin would enter the respin feature.
class EnterRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getNextFeatureType() !== CONSTANTS.FEATURE_TYPE_RESPIN) {
      StateManager.goToState(STATES.COMPLETE_GAMEROUND_STATE);
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    await Clock.wait(INTRO_DELAY);
    // Both happen at the wipe's midpoint, hidden behind it: the layout swaps (which flips
    // respinActive, routing later rounds into CheckRespinState) and next() shows the intro.
    EventHandler.dispatchEvent(JCEvents.PLAY_TRANSITION, {
      onHalfway: () => {
        EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, { active: true });
        StateManager.next();
      },
    });
  }
}

export const EnterRespinState = new EnterRespinStateCommand();
