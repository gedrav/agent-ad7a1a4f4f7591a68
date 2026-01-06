import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';

class ShowTumbleStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.BLAST_SYMBOLS);
  }

  public doNextStep(data?: any): void {
    super.doNextStep(data);
    appModel.tumbleIndex++;
    StateManager.goToState(STATES.SHOW_SPIN_WIN_STATE);
  }
}

export const ShowTumbleState = new ShowTumbleStateCommand();
