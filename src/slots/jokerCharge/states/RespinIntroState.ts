import { RespinIntroStateCommand } from '@core/commands/states/RespinIntroState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '../events/JCEvents';

// Holds the feature on the "BONUS GAME" info screen (see RespinIntroComp) until the player taps.
class JCRespinIntroStateCommand extends RespinIntroStateCommand {
  protected showIntro(onConfirm: () => void): void {
    EventHandler.dispatchEvent(JCEvents.SHOW_RESPIN_INTRO, { onConfirm });
  }
}

export const RespinIntroState = new JCRespinIntroStateCommand();
