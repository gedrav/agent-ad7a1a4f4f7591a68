import { StateCommand } from '@core/commands/core/StateCommand';
import { CheckFeatureStateV2 } from '@core/commands/states/CheckFeatureStateV2';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { isSecondaryAssetsReady } from '../models/JCAssetsState';

// corelib's own check waits for SECONDARY behind appModel.secondaryAssetsLoaded, which this game
// forces true at start-up - see JCAssetsState. So the wait is done here against the real thing,
// on the same loading screen, which runs this state again once the feature's art is in.
class JCCheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    if (appModel.getIsFeatureTriggered() && appModel.getNextFeatureType() && !isSecondaryAssetsReady()) {
      super.execute(data);
      appModel.waitingForFeature = true;
      EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
      return;
    }
    await CheckFeatureStateV2.execute(data);
  }
}

export const CheckFeatureState = new JCCheckFeatureStateCommand();
