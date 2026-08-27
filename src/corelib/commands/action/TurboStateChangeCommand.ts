import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class TurboStateChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    appModel.turboMode = data;
    EventHandler.dispatchEvent(SlotEvents.TURBO_STATE_CHANGED);
    WrapperProxy.postActivityEvent('ingame_casino_turbo_click', { value: data ? 'on' : 'off' });
  }
}

export const TurboStateChangeCommand = new TurboStateChangeCmd();
