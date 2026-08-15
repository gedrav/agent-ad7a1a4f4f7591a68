import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GAMESTATES } from './GameStates';
import { FEATURE_NAMES } from '@slots/meowmeowmeow/config/FeatureNames';

class MMMCheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    const featureType = appModel.getFeatureType() || appModel.getFeatureName() || '';

    if (featureType.toUpperCase() === FEATURE_NAMES.GREEN) {
      StateManager.goToState(GAMESTATES.GREEN_ENTER_FREESPINS_STATE);
      return;
    } else if (featureType.toUpperCase() === FEATURE_NAMES.BLUE) {
      StateManager.goToState(GAMESTATES.WHEEL_FEATURE_STATE);
      return;
    } else if (featureType.toUpperCase() === FEATURE_NAMES.RED) {
      // TODO: Implement RED feature later. Bypassing for now.
      StateManager.next();
      return;
    }

    StateManager.next();
  }
}

export const MMMCheckFeatureState = new MMMCheckFeatureStateCommand();
