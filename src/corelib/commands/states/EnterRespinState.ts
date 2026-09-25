import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { StateCommand } from '../core/StateCommand';

// Opens the respin feature. A game extends this to add its own trigger presentation and to hide
// the swap into the feature's layout behind a transition - see jokerCharge's EnterRespinState.
//
// The feature-type guard is load-bearing: CheckFeatureStateV2's final `else { StateManager.next()
// }` (an ordinary spin, no feature) falls through onto whatever follows CHECK_FEATURE_STATE, so
// without it every non-feature spin would enter the feature.
export class EnterRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getNextFeatureType() !== CONSTANTS.FEATURE_TYPE_RESPIN) {
      StateManager.goToState(STATES.COMPLETE_GAMEROUND_STATE);
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    await this.playTriggerPresentation();
    this.openFeature();
  }

  // Whatever the trigger looks like for this game - a win pass, a symbol reveal, a popup.
  // Resolves when it has finished; the feature opens next.
  protected async playTriggerPresentation(): Promise<void> {}

  // Swaps into the feature and hands over to the intro state. Override to cover the swap with a
  // transition, calling StateManager.next() at the point it is hidden.
  protected openFeature(): void {
    StateManager.next();
  }
}

export const EnterRespinState = new EnterRespinStateCommand();
