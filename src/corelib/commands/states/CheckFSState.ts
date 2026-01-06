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

    // Check if autoplay should stop due to onBonusWin after first free spin
    if (
      appModel.getIsAutoSession() &&
      appModel.getAutoSpinObj()?.onBonusWin &&
      appModel.getAutoSpinObj()?.featureTriggered
    ) {
      appModel.resetAutoplayData();
    }

    if (appModel.getIsNextFSPossible()) {
      // Update balance for each free spin before next spin
      EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
      if (appModel.isFSRetriggered()) {
        const obj: any = {};
        obj.title = Util.getContent('CongratTitle');
        obj.message1 = Util.parseMessage(Util.getContent('FSRetriggerText'), [appModel.getFSRetriggerCount()]);
        obj.callbackFunction = this.doNextStep.bind(this);
        EventHandler.dispatchEvent(SlotEvents.SHOW_FS_POPUP, obj);
      } else {
        await Clock.wait(500);
        this.doNextStep();
      }
    } else {
      StateManager.goToState(STATES.EXIT_FREESPINS_STATE);
    }
  }
  public doNextStep(): void {
    StateManager.goToState(STATES.FS_SPIN_START_STATE);
  }
}

export const CheckFSState = new CheckFSStateCommand();
