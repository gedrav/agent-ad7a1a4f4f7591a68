import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';

class GreenEnterTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent('showGreenFeature');
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GreenEnterTransitionState = new GreenEnterTransitionStateCommand();
