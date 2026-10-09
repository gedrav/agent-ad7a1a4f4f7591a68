import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { getPostJackpotState } from '@core/commands/states/JackpotFlowHelper';

class ShowJackpotGameStateCommand extends StateCommand {
  protected count: number;
  public async execute(data: any = null) {
    super.execute(data);
    this.count = 0;
    appModel.isBusy = true;
    appModel.freezeJackpotMeters();

    if (appModel.secondaryAssetsLoaded) {
      EventHandler.dispatchEvent(SlotEvents.SHOW_JACKPOT_INTRO_ANIM);
    } else {
      appModel.waitingForFeature = true;
      EventHandler.dispatchEvent(SlotEvents.SHOW_SECONDARY_LOADING_SCREEN);
    }
  }
  doNextStep() {
    this.count++;
    // if (this.count == 1) {
    //   EventHandler.dispatchEvent(SlotEvents.SHOW_JACKPOT_CARD_GAME);
    // }{
    EventHandler.dispatchEvent(SlotEvents.HIDE_JACKPOT_BG);
    // Must clear, otherwise CompleteGameRoundState re-enters this state
    appModel.jackpotRound = null;
    appModel.unfreezeJackpotMeters();
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    // Config order puts CHECK_PROMOFS_STATE next, which would skip autospin handling
    StateManager.goToState(getPostJackpotState());
  }
  // }
}

export const ShowJackpotGameState = new ShowJackpotGameStateCommand();
