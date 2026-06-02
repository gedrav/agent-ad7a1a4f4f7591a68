import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Clock } from '@core/utils/Clock';
class CheckFSStateCommand extends StateCommand {
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
    EventHandler.dispatchEvent(SlotEvents.PLAY_FS_ENTRY_POPUP_SOUND);
    const obj: any = {};
    obj.title = Util.getContent('CongratTitle');
    obj.message1 = Util.parseMessage(Util.getContent('FSRetriggerText'), [appModel.getFSRetriggerCount()]);
    obj.callbackFunction = this.exitState.bind(this);
    EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
  }
  public exitState(): void {
    StateManager.goToState(STATES.FS_SPIN_START_STATE);
  }
}

export const CheckFSState = new CheckFSStateCommand();
