import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class ShowHideSplashCmd extends ActionCommand {
  public execute(data: boolean = null) {
    super.execute(data);
    WrapperProxy.postActivityEvent('ingame_casino_show_splash', { origin: 'menu', value: data ? 'show' : 'hide' });
    appModel.setPreferencesShow(data);
    MessageProxy.savePreferences(appModel.getPreferences());
    EventHandler.dispatchEvent(SlotEvents.SHOW_INTRO_STATE_CHANGED, data);
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const ShowHideSplashCommand = new ShowHideSplashCmd();
