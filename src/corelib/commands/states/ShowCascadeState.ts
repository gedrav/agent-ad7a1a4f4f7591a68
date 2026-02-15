import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class ShowCascadeStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    appModel.tumbleIndex++;
    EventHandler.dispatchEvent(SlotEvents.CASCADE_SYMBOLS);
  }

  public doNextStep(data?: any): void {
    super.doNextStep(data);
    StateManager.goToState(STATES.SHOW_TUMBLE_WIN_STATE);
  }
}

export const ShowCascadeState = new ShowCascadeStateCommand();
