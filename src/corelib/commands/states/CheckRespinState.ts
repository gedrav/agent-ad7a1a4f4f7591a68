import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { StateCommand } from '../core/StateCommand';

// Loop or exit, after each respin round.
//
// fsInfo.isClosed is generic per-feature-round bookkeeping despite the "fs" naming:
// storeFeatureResult() fills it from featureResults[].closed for any feature type.
export class CheckRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (this.isFeatureOver()) {
      StateManager.goToState(STATES.EXIT_RESPIN_STATE);
    } else {
      StateManager.goToState(STATES.RESPIN_SPIN_START_STATE);
    }
  }

  protected isFeatureOver(): boolean {
    return appModel.fsInfo.isClosed;
  }
}

export const CheckRespinState = new CheckRespinStateCommand();
