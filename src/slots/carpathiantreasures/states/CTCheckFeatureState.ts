import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';

class CTCheckFSStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const isScatter = appModel.getSpinResult().scatterPositions;
    if (isScatter.length > 0) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_SCATTER_TRIGGER);
    } else {
      StateManager.next();
    }
  }
  public doNextStep(): void {
    StateManager.next();
  }
}

export const CheckFSStateCT = new CTCheckFSStateCommand();
