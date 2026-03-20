import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';

class SoundStateChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    SoundFactory.ambientState = data;
    SoundFactory.sfxState = data;
    appModel.setPreferencesSound(data);
    EventHandler.dispatchEvent(SlotEvents.SOUND_STATE_CHANGED, data);
    appModel.savePreferences();
  }
}

export const SoundStateChangeCommand = new SoundStateChangeCmd();
