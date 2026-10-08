import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AppEvents } from '@core/events/AppEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';

class PigCheckUnfinishedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    if (!appModel.getIsUnfinishedGame()) {
      if (appModel.getIsPromoFSSession()) {
        StateManager.goToState(STATES.RESUME_PROMOFS_STATE);
      } else {
        StateManager.next();
      }
      return;
    }

    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET);
    if (appModel.getIsAnteBetOn()) {
      EventHandler.dispatchEvent(SlotEvents.UPDATE_UNFINISHED_ANTE_BET);
    }
    EventHandler.dispatchEvent(SlotEvents.RENDER_UNFINISHED_REEL);
    EventHandler.dispatchEvent(SlotEvents.DISALBE_ANTE_BB_BUTTON);

    if (!appModel.getIsFeatureTriggered()) {
      StateManager.next();
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
    const feature = appModel.getUnfinishedFeatureType();
    StateManager.goToState(
      feature === CONSTANTS.FEATURE_TYPE_PICK ? STATES.ENTER_PICK_FEATURE_STATE : STATES.ENTER_FREESPINS_STATE,
    );
  }
}

export const PigCheckUnfinishedState = new PigCheckUnfinishedStateCommand();
