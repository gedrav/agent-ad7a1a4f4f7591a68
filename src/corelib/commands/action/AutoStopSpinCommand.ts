import { ActionCommand } from '@core/commands/core/ActionCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GameProxy } from '@core/models/GameConfigProxy';

class AutoStopSpinCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    appModel.resetAutoplayData();
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_UPDATE_UI_FORCE_STOP);
    GameProxy.config.isAutoStopped = true;
  }
}

export const AutoStopSpinCommand = new AutoStopSpinCmd();
