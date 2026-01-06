import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class MenuCompAmbientSoundToggleCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    SoundFactory.ambientState = !SoundFactory.ambientState;
    EventHandler.dispatchEvent(SlotEvents.MENU_COMP_AMBIENT_SOUND_TOGGLED, SoundFactory.ambientState);
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const MenuCompAmbientSoundToggleCommand = new MenuCompAmbientSoundToggleCmd();
