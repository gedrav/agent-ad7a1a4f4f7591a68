import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

// Loop/exit decision after each respin round, reached from JCSpinResponseReceivedState.doNextStep()
// rather than the usual win-presentation pipeline - a respin round has no paylines to show.
//
// fsInfo.isClosed is generic per-feature-round bookkeeping despite the "fs" naming:
// storeFeatureResult() fills it from featureResults[].closed for any feature type.
class CheckRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.fsInfo.isClosed) {
      StateManager.goToState(STATES.EXIT_RESPIN_STATE);
    } else {
      StateManager.goToState(STATES.RESPIN_SPIN_START_STATE);
    }
  }
}

export const CheckRespinState = new CheckRespinStateCommand();
