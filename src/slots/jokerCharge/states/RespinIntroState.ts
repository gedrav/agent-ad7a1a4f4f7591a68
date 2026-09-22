import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { JCEvents } from '../events/JCEvents';

// Holds the feature on the "BONUS GAME" info screen (see RespinIntroComp) between EnterRespinState
// and the first respin round. Like EnterRespinState it deliberately doesn't advance on its own -
// the player's tap is what releases it.
class RespinIntroStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(JCEvents.SHOW_RESPIN_INTRO, {
      onConfirm: () => StateManager.next(),
    });
  }
}

export const RespinIntroState = new RespinIntroStateCommand();
