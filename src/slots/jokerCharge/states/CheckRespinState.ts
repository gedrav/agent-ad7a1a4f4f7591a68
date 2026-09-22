import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { JCEvents } from '../events/JCEvents';

// Loop/exit decision after each respin round, reached from JCSpinResponseReceivedState.doNextStep()
// rather than the usual win-presentation pipeline - a respin round has no paylines to show.
//
// appModel.fsInfo is generic per-feature-round bookkeeping despite the "fs" naming:
// storeFeatureResult() fills it from featureResults[] for any feature type.
//
// ASSUMPTION, unverified against a real respin response: remaining = totalFreespins - currentFreespin.
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
