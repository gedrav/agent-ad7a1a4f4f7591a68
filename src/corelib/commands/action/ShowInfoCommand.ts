import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

class ShowInfoCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const ShowInfoCommand = new ShowInfoCmd();
