import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class CheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getIsFeatureTriggered()) {
      if (appModel.getIsFreeSpinsSession()) {
        if (appModel.getIsLightningSession()) {
          StateManager.goToState(STATES.LIGHTNING_CHECK_FS_STATE);
        } else {
          StateManager.goToState(STATES.CHECK_FS_STATE);
        }
      } else if (appModel.getIsFSTriggered()) {
        if (appModel.getIsLightningSession()) {
          StateManager.goToState(STATES.LIGHTNING_ENTER_FREESPINS_STATE);
        } else {
          StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
        }
      } else {
        console.log('feature but not FS, handle');
      }
    } else {
      StateManager.next();
    }
  }
}

export const CheckFeatureState = new CheckFeatureStateCommand();
