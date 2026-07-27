import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';

class GamePreWinStateCommand extends StateCommand {
  public async execute(data?: any): Promise<void> {
    super.execute(data);
    const expandingResultData = appModel.getSpinResult().wildExpandedReels;
    if (expandingResultData.length > 0 && appModel.getSpinResult().winLines.length !== 0) {
      EventHandler.dispatchEvent('EXPAND_WILD', expandingResultData);
    } else {
      StateManager.next();
    }
  }
}

export const GamePreWinState = new GamePreWinStateCommand();
