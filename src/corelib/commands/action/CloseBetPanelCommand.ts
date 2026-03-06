import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';

class CloseBetPanelCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    if (data) {
      if (GameProxy.config.tempTotalBet > 0) {
        appModel.setTotalBet(GameProxy.config.tempTotalBet);
        EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET, data.value);
      }
    } else {
      if (GameProxy.config.PreviousBet > 0) {
        appModel.setTotalBet(GameProxy.config.PreviousBet);
        EventHandler.dispatchEvent(SlotEvents.UPDATE_TOTALBET, data.value);
      }
    }
    GameProxy.config.PreviousBet = 0;
    EventHandler.dispatchEvent(SlotEvents.HIDE_BET_PANEL);
  }
}

export const CloseBetPanelCommand = new CloseBetPanelCmd();
