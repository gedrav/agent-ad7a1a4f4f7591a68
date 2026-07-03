import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';

class GamePreWinStateCommand extends StateCommand {
  private readonly timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);
    const result = appModel.getReelModifiersData();
    if (result?.type == 'addWildFeatureTriggered') {
      const data: any = {};
      data.wildPositions = result.wildPositions;
      data.numberOfWilds = result.numberOfWilds;
      EventHandler.dispatchEvent('SHOW_WILD_BLAST', data);
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
