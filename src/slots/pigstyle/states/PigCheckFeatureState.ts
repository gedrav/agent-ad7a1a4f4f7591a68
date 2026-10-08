import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AppEvents } from '@core/events/AppEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';

class PigCheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    if (!appModel.getIsFeatureTriggered()) {
      if (appModel.getIsFreeSpinsSession()) {
        StateManager.goToState(STATES.CHECK_FS_STATE);
      } else {
        StateManager.next();
      }
      return;
    }

    this.waitForSecondaryAssets();
  }

  protected waitForSecondaryAssets(): void {
    if (appModel.secondaryAssetsLoaded) {
      this.enterFeature();
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
    EventHandler.addEventListener(AppEvents.SECONDARY_ASSETS_LOADED, this.onSecondaryAssetsLoaded);
  }

  protected onSecondaryAssetsLoaded = (): void => {
    EventHandler.removeEventListener(AppEvents.SECONDARY_ASSETS_LOADED, this.onSecondaryAssetsLoaded);
    this.enterFeature();
  };

  protected enterFeature(): void {
    if (appModel.getFeatureType() === CONSTANTS.FEATURE_TYPE_PICK) {
      StateManager.goToState(STATES.ENTER_PICK_FEATURE_STATE);
      return;
    }
    StateManager.goToState(appModel.getIsFreeSpinsSession() ? STATES.CHECK_FS_STATE : STATES.ENTER_FREESPINS_STATE);
  }
}

export const PigCheckFeatureState = new PigCheckFeatureStateCommand();
