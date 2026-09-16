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

// Auto-starts each respin round - no button press, mirrors corelib's FSSpinStartState. Requests
// the round from the same dedicated feature endpoint freespins/pick already use
// (MessageProxy.requestBonusData(), message name 'featureResult'), passing the feature-type
// constant directly rather than appModel.getFeatureName() - that field is only ever populated for
// FEATURE_TYPE_FREESPIN (see AppModelService.storeSpinResult()), so it would be empty here.
//
// Hands off to JCSpinResponseReceivedState like a normal spin; that state's doNextStep() routes
// back into CheckRespinState instead of completing the round, since appModel.featureResult is
// still a 'respin' result at that point.
class RespinSpinStartStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_ROUND);
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
