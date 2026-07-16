import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

class GreenEnterFreespinsStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    let interfaceSize =
      Number(appModel.featureResult?.interfaceSize) || Number(appModel.gameResult?.interfaceSize) || 4;
    if (interfaceSize < 4) {
      interfaceSize = 4;
    }
    // Update the reel layout dynamically for the Green feature via events
    EventHandler.dispatchEvent('UPDATE_REEL_LAYOUT', interfaceSize);

    if (appModel.getIsUnfinishedFreespins()) {
      EventHandler.dispatchEvent(SlotEvents.RENDER_UNFINISHED_REEL);
    }

    // Proceed to the core ENTER_FREESPINS_STATE after handling the Green-specific setup
    StateManager.goToState(STATES.ENTER_FREESPINS_STATE);
  }
}

export const GreenEnterFreespinsState = new GreenEnterFreespinsStateCommand();
