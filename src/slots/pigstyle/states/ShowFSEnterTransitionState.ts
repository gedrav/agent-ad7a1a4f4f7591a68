import { StateCommand } from '@core/commands/core/StateCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';

class ShowFSEnterTransitionStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);

    if (appModel.getIsUnfinishedGame()) {
      EventHandler.dispatchEvent(
        appModel.getIsFreeSpinsSession() ? SlotEvents.SHOW_FREEGAME_BG : SlotEvents.SHOW_MAINGAME_BG,
      );
      this.doNextStep();
      return;
    }

    EventHandler.dispatchEvent(SlotEvents.SHOW_TRANSITION_ANIM);
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    StateManager.next();
  }
}

export const ShowFSEnterTransitionState = new ShowFSEnterTransitionStateCommand();
