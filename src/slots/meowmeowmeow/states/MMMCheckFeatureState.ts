import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class MMMCheckFeatureStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getFeatureType() == 'green') {
    }
  }
}

export const MMMCheckFeatureState = new MMMCheckFeatureStateCommand();
