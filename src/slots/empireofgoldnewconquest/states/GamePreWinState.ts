import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Clock } from '@core/utils/Clock';

class GamePreWinStateCommand extends StateCommand {
  private timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);
    const result = appModel.getReelModifiersData();
    if (result && result.type == 'symbolChangeApplied') {
      const data: any = {};
      data.changedPositions = result.changedPositions;
      data.selectedHigh = result.selectedHigh;
      data.selectedLow = result.selectedLow;
      EventHandler.dispatchEvent(SlotEvents.LOWPAY_SYMBOL_CONVERSION, data);
    } else {
      StateManager.next();
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GamePreWinState = new GamePreWinStateCommand();
