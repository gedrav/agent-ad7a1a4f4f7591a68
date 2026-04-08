import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';

class GameIdleStateCommand extends StateCommand {
  private intervalId: any;
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.IDLE_STATE_ENTRY);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    const winData = appModel.getWinData();
    if (!appModel.isCascadeGame()) {
      if (winData?.length > 0) {
        this.showLineWin();
        this.intervalId = setInterval(this.showLineWin.bind(this), 2000);
      } else {
        EventHandler.dispatchEvent(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION);
      }
    } else {
      EventHandler.dispatchEvent(SlotEvents.SHOW_SYMBOL_IDLE_ANIMATION);
    }
  }

  protected showLineWin(): void {
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.SHOW_LINE_WIN);
  }

  public async destroy(data: any = null): Promise<void> {
    super.destroy(data);
    clearInterval(this.intervalId);
  }
}

export const GameIdleState = new GameIdleStateCommand();
