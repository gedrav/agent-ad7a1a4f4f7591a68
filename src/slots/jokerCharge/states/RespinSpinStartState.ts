import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { Clock } from '@core/utils/Clock';
import { Util } from '@core/utils/UtilService';
import { JCEvents } from '../events/JCEvents';
import { registerRespinRound } from '../models/JCRespinState';

// Lets the round that just settled be read before the reels move again.
const ROUND_GAP = 500;

// Auto-starts each respin round, no button press. Passes the feature-type constant to
// requestBonusData() rather than appModel.getFeatureName(), which corelib only ever populates for
// FEATURE_TYPE_FREESPIN and so would be empty here.
class RespinSpinStartStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_ROUND);
    await Clock.wait(ROUND_GAP);
    // Judges the round that just finished, so the counter moves as this spin starts.
    const remaining = registerRespinRound(appModel.featureResult?.holdField?.length ?? 0);
    EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, remaining);
    EventHandler.dispatchEvent(SlotEvents.START_SPIN);
    appModel.spinStartTime = Util.getCurrentTimeInMili();

    await MessageProxy.requestBonusData(CONSTANTS.FEATURE_TYPE_RESPIN);
    await Clock.wait(250);
    if (!appModel.isErrorOccurred) {
      StateManager.goToState(STATES.SPIN_RESPONSE_RECEIVED_STATE);
    } else {
      EventHandler.dispatchEvent(SlotEvents.RESET_REEL_FOR_ERROR);
    }
  }
}

export const RespinSpinStartState = new RespinSpinStartStateCommand();
