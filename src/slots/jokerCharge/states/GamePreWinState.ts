import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Clock } from '@core/utils/Clock';
import { Util } from '@core/utils/UtilService';

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
      const rnd = Util.getRandomRange(1, 40);
      if (rnd === 1) {
        EventHandler.dispatchEvent('SHOW_WILD_BLAST_ANTICIPATION');
      } else {
        StateManager.next();
      }
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GamePreWinState = new GamePreWinStateCommand();
