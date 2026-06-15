import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

class BookShowSpinWinStateCommand extends StateCommand {
  private completedIndex: number;

  public async execute(data: any = null) {
    super.execute(data);
    appModel.isSymbolExpanded = false;

    if (appModel.getSpinWin() > 0) {
      this.completedIndex = 0;
      EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_WIN);
    } else {
      StateManager.next();
    }
  }
  public doNextStep(): void {
    this.completedIndex++;
    if (this.completedIndex === 2) {
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
      StateManager.next();
    }
  }

  public async destroy(data: any = null): Promise<void> {
    super.destroy(data);
  }
}

export const BookShowSpinWinState = new BookShowSpinWinStateCommand();
