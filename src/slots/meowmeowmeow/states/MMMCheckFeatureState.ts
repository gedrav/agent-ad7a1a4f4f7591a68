import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GAMESTATES } from './GameStates';

class MMMCheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const featureType = appModel.getFeatureType() || appModel.getFeatureName() || '';

    if (featureType.toUpperCase() === 'GREEN') {
      StateManager.goToState(GAMESTATES.GREEN_ENTER_FREESPINS_STATE);
      return;
    } else if (featureType.toUpperCase() === 'BLUE') {
      StateManager.goToState(GAMESTATES.WHEEL_FEATURE_STATE);
      return;
    } else if (featureType.toUpperCase() === 'RED') {
      // TODO: Implement RED feature later. Bypassing for now.
      StateManager.next();
      return;
    }

    StateManager.next();
  }
}

export const MMMCheckFeatureState = new MMMCheckFeatureStateCommand();
