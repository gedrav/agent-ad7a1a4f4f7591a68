import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { JCEvents } from '../events/JCEvents';

// Loop/exit decision after each respin round settles - mirrors corelib's CheckFSState. Reached
// directly from JCSpinResponseReceivedState.doNextStep(), bypassing the generic SpinStoppedState/
// GamePreWinState/ShowSpinWinState win-presentation pipeline entirely: a respin round has no
// paylines to show, only whatever the backend locked this round.
//
// appModel.fsInfo is corelib's generic per-feature-round bookkeeping - storeFeatureResult() fills
// it from featureResults[].currentCount/totalCount/totalWin/closed for any feature type, despite
// the "fs" naming - reused here instead of adding respin-specific fields to corelib.
//
// ASSUMPTION pending a real respin featureResult sample: "remaining respins" is
// totalFreespins - currentFreespin. Confirm/adjust once the backend contract is known.
class CheckRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const remaining = appModel.fsInfo.totalFreespins - appModel.fsInfo.currentFreespin;
    EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, remaining);

    if (appModel.fsInfo.isClosed) {
      StateManager.goToState(STATES.EXIT_RESPIN_STATE);
    } else {
      StateManager.goToState(STATES.RESPIN_SPIN_START_STATE);
    }
  }
}

export const CheckRespinState = new CheckRespinStateCommand();
