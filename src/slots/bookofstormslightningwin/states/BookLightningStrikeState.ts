import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class BookLightningStrikeStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const lightningData = appModel.getLightningStrikeData();
    if (!lightningData) {
      StateManager.next();
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.SHOW_LIGHTNING_STRIKE);
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const BookShowLightningStrikeState = new BookLightningStrikeStateCommand();
