import { StateCommand } from '@core/commands/core/StateCommand';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { CONSTANTS } from '@core/utils/CONSTANTS';

class ShowSpinWinStateCommand extends StateCommand {
  private timeoutId: any;
  private completedIndex: number;
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.isCascadeGame()) {
      const winType = appModel.getWinType();
      if (
        (appModel.getTotalCascadeWin() > 0 &&
          winType !== CONSTANTS.BELOW_TOTALBET_WIN &&
          winType !== CONSTANTS.STANDARD_WIN) ||
        appModel.getScatterPay() > 0
      ) {
        this.completedIndex = 0;
        EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_WIN);
        this.checkToActivateButtons();
      } else {
        StateManager.next();
      }
    } else {
      if (appModel.getSpinWin() > 0) {
        this.completedIndex = 0;
        EventHandler.dispatchEvent(SlotEvents.SHOW_SPIN_WIN);
        this.checkToActivateButtons();
      } else {
        StateManager.next();
      }
    }
  }
  checkToActivateButtons(): void {
    if (!appModel.getIsFeatureTriggered() && !appModel.getIsAutoSession() && !appModel.isTumbleRemaining()) {
      EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
    }
  }
  public doNextStep(): void {
    this.completedIndex++;
    if (appModel.isCascadeGame()) {
      if (this.completedIndex === 1) {
        //stopping at 1 as there will be not any symbol anim while spin ends
        EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
        StateManager.next();
      }
    } else {
      if (this.completedIndex === 2) {
        EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
        StateManager.next();
      }
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

export const ShowSpinWinState = new ShowSpinWinStateCommand();
