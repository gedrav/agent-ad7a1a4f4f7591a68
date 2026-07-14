import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GreenEnterFreespinsState } from '@slots/meowmeowmeow/states/GreenEnterFreespinsState';

class MMMCheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const featureType = appModel.getFeatureType() || appModel.getFeatureName() || '';

    if (featureType.toUpperCase() === 'GREEN') {
      GreenEnterFreespinsState.execute(data);
    }

    // fsInfo is now dynamically populated in MeowPreSpinWinState

    StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
  }
}

export const MMMCheckFeatureState = new MMMCheckFeatureStateCommand();
