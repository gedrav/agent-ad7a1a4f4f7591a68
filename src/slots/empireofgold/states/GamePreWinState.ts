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
    if (result && result.type == 'addWildFeatureTriggered') {
      const data: any = {};
      data.wildPositions = result.wildPositions;
      data.numberOfWilds = result.numberOfWilds;
      EventHandler.dispatchEvent('SHOW_WILD_BLAST', data);
    } else {
      // generate a random number between 1 - 5;
      /*if (rnd == 1) {
        EventHandler.dispatchEvent('SHOW_WILD_BLAST_ANTICIPATION')
      } else {
        StateManager.next();
       }
      */

      StateManager.next();
    }
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GamePreWinState = new GamePreWinStateCommand();
