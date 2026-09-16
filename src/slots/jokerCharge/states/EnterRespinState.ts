import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { Clock } from '@core/utils/Clock';
import { JCEvents } from '../events/JCEvents';

// Beat between the triggering spin landing and the screen wiping over to the bonus layout, so the
// win that triggered the feature stays readable for a moment.
const INTRO_DELAY = 3000;

// Intro state for the respin (Hold & Win) feature - reached from CheckFeatureStateV2/
// CheckUnfinishedStateV2 once the backend signals a respin round was triggered.
//
// The guard below isn't defensive boilerplate: CheckFeatureStateV2's final `else { StateManager.
// next() }` (an ordinary spin, no feature) falls through onto whatever's next in jokerCharge's
// StatesConfig array, which is this state - without the guard, every non-feature spin would
// wrongly enter the respin feature too. Mirrors corelib's EnterPickFeatureState.
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
    // Switches to the bonus layout, plays the intro transition and flips JCLinesState's
    // respinActive (which is what routes later rounds into CheckRespinState - see
    // JCSpinResponseReceivedState). Deliberately does NOT advance on its own: the first feature
    // request only goes out once the player confirms the intro.
    EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, {
      active: true,
      onConfirm: () => StateManager.next(),
    });
  }
}

export const EnterRespinState = new EnterRespinStateCommand();
