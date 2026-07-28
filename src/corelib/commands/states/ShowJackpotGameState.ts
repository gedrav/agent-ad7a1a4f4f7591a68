import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class ShowJackpotGameStateCommand extends StateCommand {
  count: number;
  public async execute(data: any = null) {
    super.execute(data);
    this.count = 0;
    EventHandler.dispatchEvent(SlotEvents.SHOW_JACKPOT_INTRO_ANIM);
  }
  doNextStep() {
    this.count++;
    if (this.count == 1) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_JACKPOT_CARD_GAME);
    } else if (this.count == 2) {
      EventHandler.dispatchEvent(SlotEvents.JACKPOT_WIN_TICKER_ANIM);
    } else {
      EventHandler.dispatchEvent(SlotEvents.HIDE_JACKPOT_BG);
      StateManager.next();
    }
  }
}

export const ShowJackpotGameState = new ShowJackpotGameStateCommand();
