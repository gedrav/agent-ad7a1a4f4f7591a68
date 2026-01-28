import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class CheckToCollectMultiplierStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const toCollectMultiplier = false; //appModel.toCollectMultiplier();   // WIP
    if (!toCollectMultiplier) {
      StateManager.goToState(STATES.CHECK_FEATURE_STATE);
    } else {
      StateManager.next();
    }
  }
}

export const CheckToCollectMultiplierState = new CheckToCollectMultiplierStateCommand();
