import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

class CheckFSStateCTCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const isScatter = appModel.getSpinResult().scatterPositions;
    if (isScatter.length > 0) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_SCATTER_TRIGGER);
    }
  }
}

export const CheckFSStateCT = new CheckFSStateCTCommand();
