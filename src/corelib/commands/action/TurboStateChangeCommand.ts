import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class TurboStateChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    appModel.turboMode = data;
    EventHandler.dispatchEvent(SlotEvents.TURBO_STATE_CHANGED);
  }
}

export const TurboStateChangeCommand = new TurboStateChangeCmd();
