import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

class ShowHideSplashCmd extends ActionCommand {
  public execute(data: boolean = null) {
    super.execute(data);
    appModel.setPreferencesShow(data);
    appModel.savePreferences();
    EventHandler.dispatchEvent(SlotEvents.SHOW_INTRO_STATE_CHANGED, data);
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const ShowHideSplashCommand = new ShowHideSplashCmd();
