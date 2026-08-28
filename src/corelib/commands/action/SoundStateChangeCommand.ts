import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class SoundStateChangeCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    const value = typeof data === 'object' ? data.value : data;
    const origin = typeof data === 'object' ? data.origin : 'game';
    SoundFactory.ambientState = value;
    SoundFactory.sfxState = value;
    appModel.setPreferencesSound(value);
    EventHandler.dispatchEvent(SlotEvents.SOUND_STATE_CHANGED, value);
    MessageProxy.savePreferences(appModel.getPreferences());
    WrapperProxy.postActivityEvent('ingame_casino_mute', { origin, value: value ? 'unmute' : 'mute' });
  }
}

export const SoundStateChangeCommand = new SoundStateChangeCmd();
