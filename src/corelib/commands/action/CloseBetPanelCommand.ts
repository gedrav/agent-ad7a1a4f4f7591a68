import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { CONSTANTS } from '@core/utils/CONSTANTS';

class CloseBetPanelCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    // data=true → Set button, data=false → Cancel button
    if (data && appModel.getWinDataLength() > 0) {
      (StateManager.currentState as any)?.state?.destroy();
      const winType = appModel.getWinType();
      const isBigWin =
        winType === CONSTANTS.BIG_WIN ||
        winType === CONSTANTS.MEGA_WIN ||
        winType === CONSTANTS.GIGANTIC_WIN ||
        winType === CONSTANTS.UNBELIEVABLE_WIN;
      if (isBigWin) {
        EventHandler.dispatchEvent(SlotEvents.SKIP_REELTICKER_WIN);
      }
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
      EventHandler.dispatchEvent('STOP_ALL_WIN_SOUND_BIGWIN');
      EventHandler.dispatchEvent('PLAY_BIG_WIN_COUNTUP_END_SOUND');
    }
    EventHandler.dispatchEvent(data ? SlotEvents.CONFIRM_BET : SlotEvents.HIDE_BET_PANEL);
  }
}

export const CloseBetPanelCommand = new CloseBetPanelCmd();
