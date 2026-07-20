import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateCommand } from '../core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';

class PickFeatureStateCommand extends StateCommand {
  public async execute(data?: any): Promise<void> {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.SHOW_PICK_FEATURE_UI, appModel.getFeatureSubType());
  }
}
export const PickFeatureState = new PickFeatureStateCommand();
