import { StateCommand } from '@core/commands/core/StateCommand';
import { CheckUnfinishedStateV2 } from '@core/commands/states/CheckUnfinishedStateV2';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { isSecondaryAssetsReady } from '../models/JCAssetsState';

// A round left mid-feature can only resume once the feature's art is in - see JCCheckFeatureState
// for why corelib's own wait doesn't cover it here. The grid is put back when this runs again,
// behind the loading screen until then.
class JCCheckUnfinishedStateCommand extends StateCommand {
  public async execute(data: any = null) {
    if (appModel.getIsUnfinishedGame() && appModel.getIsFeatureTriggered() && !isSecondaryAssetsReady()) {
      super.execute(data);
      appModel.waitingForFeature = true;
      EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
      return;
    }
    await CheckUnfinishedStateV2.execute(data);
  }
}

export const CheckUnfinishedState = new JCCheckUnfinishedStateCommand();
