import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

class BookShowSymbolExpansionStateCommand extends StateCommand {
  private timeoutId: any;
  private completedIndex: number = 0;

  public async execute(data: any = null) {
    super.execute(data);
    this.completedIndex = 0;
    appModel.isSymbolExpanded = false;
    const expansionData = appModel.getSymbolExpansionData();
    if (expansionData) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_SYMBOL_EXPANSION);
    } else {
      StateManager.next();
    }
  }

  public doNextStep(): void {
    this.completedIndex++;
    if (this.completedIndex === 1) {
      // Symbol expansion animation is done
      appModel.isSymbolExpanded = true;
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

export const BookShowSymbolExpansionState = new BookShowSymbolExpansionStateCommand();
