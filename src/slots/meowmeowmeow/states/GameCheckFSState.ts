import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Clock } from '@core/utils/Clock';

class GameCheckFSStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_FS_TOTALWIN);
    if (appModel.getIsNextFSPossible()) {
      if (appModel.isFSRetriggered()) {
        EventHandler.dispatchEvent(SlotEvents.SHOW_SCATTER_TRIGGER);
      } else {
        await Clock.wait(500);
        this.exitState();
      }
    } else {
      await Clock.wait(1000);
      StateManager.goToState(STATES.EXIT_FREESPINS_STATE);
    }
  }

  public doNextStep(): void {
    if (appModel.isFSRetriggered()) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_EXTRA_SPIN_ANIM);
    } else {
      this.exitState();
    }
  }

  public exitState(): void {
    StateManager.goToState(STATES.FS_SPIN_START_STATE);
  }
}

export const GameCheckFSState = new GameCheckFSStateCommand();
