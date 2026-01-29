import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class ShowMultiplierCollectAnimStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.COLLECT_MULTIPLIER);
  }

  public doNextStep(data?: any): void {
    super.doNextStep(data);
    StateManager.goToState(STATES.CHECK_FEATURE_STATE);
  }
}

export const ShowMultiplierCollectAnimState = new ShowMultiplierCollectAnimStateCommand();
