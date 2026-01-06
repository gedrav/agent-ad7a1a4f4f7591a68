import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class MenuCompSfxSoundToggleCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    SoundFactory.sfxState = !SoundFactory.sfxState;
    EventHandler.dispatchEvent(SlotEvents.MENU_COMP_SFX_SOUND_TOGGLED, SoundFactory.sfxState);
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const MenuCompSfxSoundToggleCommand = new MenuCompSfxSoundToggleCmd();
