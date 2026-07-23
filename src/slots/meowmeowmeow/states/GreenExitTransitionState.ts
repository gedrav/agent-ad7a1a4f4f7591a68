import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

class GreenExitTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GreenExitTransitionState = new GreenExitTransitionStateCommand();
