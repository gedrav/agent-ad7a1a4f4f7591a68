import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class HomeClickedCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    WrapperProxy.navigateToHome();
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const HomeClickedCommand = new HomeClickedCmd();
