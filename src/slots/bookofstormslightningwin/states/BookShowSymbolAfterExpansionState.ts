import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

class BookShowSymbolAfterExpansionStateCommand extends StateCommand {
  private timeoutId: any;
  private completedIndex: number = 0;

  public async execute(data: any = null) {
    super.execute(data);
    this.completedIndex = 0;

    // Check if we just did a symbol expansion
    if (appModel.isSymbolExpanded) {
      const winData = appModel.getWinData();
      if (winData && winData.length > 0) {
        EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_WIN);
      } else {
        // Fallback
        appModel.isSymbolExpanded = false;
        StateManager.next();
      }
    } else {
      StateManager.next();
    }
  }

  public doNextStep(): void {
    this.completedIndex++;
    if (this.completedIndex === 2) {
      // WinController has finished showing both the line wins and the big win presentation
      appModel.isSymbolExpanded = false;
      EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
      StateManager.next();
    }
  }

  public async destroy(data: any = null): Promise<void> {
    super.destroy(data);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const BookShowSymbolAfterExpansionState = new BookShowSymbolAfterExpansionStateCommand();
