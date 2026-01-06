import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class AutoPlayChangeToggleBtnCmd extends ActionCommand {
  public execute(data?: any, sender?: any) {
    super.execute(data, sender);
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_TOGGLE_STATE, sender);
  }
}

export const AutoPlayChangeToggleBtnCommand = new AutoPlayChangeToggleBtnCmd();
