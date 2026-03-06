import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';

class IncrementDecrementBetCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    appModel.incrementDecrementBet(data);
    GameProxy.config.tempTotalBet = appModel.getTotalBet();
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET_TEMP);
  }
}

export const IncrementDecrementBetCommand = new IncrementDecrementBetCmd();
