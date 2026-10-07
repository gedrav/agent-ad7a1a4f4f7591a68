import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class ShowJackpotGameStateCommand extends StateCommand {
  protected count: number;
  public async execute(data: any = null) {
    super.execute(data);
    this.count = 0;
    appModel.freezeJackpotMeters();
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
      // Must clear, otherwise CompleteGameRoundState re-enters this state
      appModel.jackpotRound = null;
      appModel.unfreezeJackpotMeters();
      EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
      // Config order puts CHECK_PROMOFS_STATE next, which would skip autospin handling
      StateManager.goToState(appModel.getIsPromoFSSession() ? STATES.CHECK_PROMOFS_STATE : STATES.CHECK_AUTOSPIN_STATE);
    }
  }
}

export const ShowJackpotGameState = new ShowJackpotGameStateCommand();
