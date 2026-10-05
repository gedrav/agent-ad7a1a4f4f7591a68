import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { SlotEvents } from '@core/events/SlotEvents';

const STONE_SYMBOLS = ['SF', 'SM', 'SY', 'SW', 'SG'];

function hasStones(reelView: string[][]): boolean {
  if (!reelView || !Array.isArray(reelView)) return false;
  for (let col = 0; col < reelView.length; col++) {
    const column = reelView[col];
    if (Array.isArray(column)) {
      for (let row = 0; row < column.length; row++) {
        const symbol = column[row];
        if (STONE_SYMBOLS.includes(symbol) || (typeof symbol === 'string' && symbol.startsWith('SG_'))) {
          return true;
        }
      }
    }
  }
  return false;
}

class GamePreWinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    EventHandler.dispatchEvent(SlotEvents.CLEAR_ROUND);

    const firedStone = appModel.getReelModifiers()?.find((m: any) => m.type === 'stoneFired');

    const reelView = appModel.getReelsView();
    if (hasStones(reelView) || firedStone) {
      EventHandler.dispatchEvent('SHOW_STONE_TRANSITION');
    } else {
      StateManager.next();
    }
  }

  public doNextStep(data: any = null): void {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const GamePreWinState = new GamePreWinStateCommand();
