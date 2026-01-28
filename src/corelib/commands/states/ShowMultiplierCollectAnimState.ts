import { StateCommand } from '@core/commands/core/StateCommand';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class ShowMultiplierCollectAnimStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    console.log('ASSEMBLE MULTI');
  }

  public doNextStep(data?: any): void {
    super.doNextStep(data);
    StateManager.goToState(STATES.CHECK_FEATURE_STATE);
  }
}

export const ShowMultiplierCollectAnimState = new ShowMultiplierCollectAnimStateCommand();
