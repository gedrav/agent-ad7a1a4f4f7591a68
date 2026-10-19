import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameEvent } from '@game/events/GameEvent';

class UpdateFrameBoardStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (!appModel.getIsFreeSpinsSession()) {
      StateManager.next();
      return;
    }
    EventHandler.dispatchEvent(GameEvent.UPDATE_FRAME_BOARD);
  }

  public doNextStep(data: any = null): void {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const UpdateFrameBoardState = new UpdateFrameBoardStateCommand();
