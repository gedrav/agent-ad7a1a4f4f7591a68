import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

class ShowTumbleWinStateCommand extends StateCommand {
  private completedIndex: number;
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.isCascadeGame()) {
      if (appModel.getTumbleSpinWin() > 0) {
        this.completedIndex = 0;
        EventHandler.dispatchEvent(SlotEvents.SHOW_TUMBLE_WIN);
      } else {
        StateManager.next();
      }
    } else {
      StateManager.next();
    }
  }
  public doNextStep(): void {
    this.completedIndex++;
    if (this.completedIndex === 1) {
      //stopping at 1 as we are not showing bigwin animation during tumble wins
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
      StateManager.next();
    }
  }
}

export const ShowTumbleWinState = new ShowTumbleWinStateCommand();
