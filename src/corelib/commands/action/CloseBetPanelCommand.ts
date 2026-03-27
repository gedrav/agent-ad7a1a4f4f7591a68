import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class CloseBetPanelCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    // data=true → Set button, data=false → Cancel button
    if (data && appModel.getWinDataLength() > 0) {
      (StateManager.currentState as any)?.state?.destroy();
      EventHandler.dispatchEvent(SlotEvents.SKIP_REELTICKER_WIN);
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
      EventHandler.dispatchEvent('CLEAR_ALL_WIN');
    }
    EventHandler.dispatchEvent(data ? SlotEvents.CONFIRM_BET : SlotEvents.HIDE_BET_PANEL);
  }
}

export const CloseBetPanelCommand = new CloseBetPanelCmd();
