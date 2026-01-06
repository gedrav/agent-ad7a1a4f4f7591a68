import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class SoundStateChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    SoundFactory.ambientState = data;
    SoundFactory.sfxState = data;
    EventHandler.dispatchEvent(SlotEvents.SOUND_STATE_CHANGED, data);
  }
}

export const SoundStateChangeCommand = new SoundStateChangeCmd();
