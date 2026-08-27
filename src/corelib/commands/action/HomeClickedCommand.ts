import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

class HomeClickedCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    WrapperProxy.postActivityEvent('ingame_casino_menu_click', { value: 'lobby' });
    const homeUrl = appModel.getHomeURL();
    if (homeUrl) {
      window.top.location.href = homeUrl;
    }
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const HomeClickedCommand = new HomeClickedCmd();
