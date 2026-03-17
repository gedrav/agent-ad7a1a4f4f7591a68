import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Clock } from '@core/utils/Clock';

class PreSpinWinStateCommand extends StateCommand {
  private timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);
    StateManager.next();
  }
}

export const PreSpinWinState = new PreSpinWinStateCommand();
