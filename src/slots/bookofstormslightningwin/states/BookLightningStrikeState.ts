import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class BookLightningStrikeStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    const modifiers = appModel.getReelModifiers();
    const lightningData = modifiers?.find((m: any) => m.type === 'lightningStrike');
    if (lightningData) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_LIGHTNING_STRIKE);
    } else {
      StateManager.next();
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const BookShowLightningStrikeState = new BookLightningStrikeStateCommand();
