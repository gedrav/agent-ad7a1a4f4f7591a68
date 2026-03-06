import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';

class ChangeTotalBetCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    GameProxy.config.tempTotalBet = data;
    appModel.setTotalBet(data);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET_TEMP);
  }
}

export const ChangeTotalBetCommand = new ChangeTotalBetCmd();
