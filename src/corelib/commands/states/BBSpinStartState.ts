import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Clock } from '@core/utils/Clock';
import { Util } from '@core/utils/UtilService';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class BBSpinStartStateCommand extends StateCommand {
  private readonly timeoutId: any;
  public async execute(data: any = null) {
    super.execute(data);
    WrapperProxy.postLifecycleEvent('GameBusy', { reason: 'bonus' });
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_ROUND);
    EventHandler.dispatchEvent(SlotEvents.RESET_MULTIPLIER); // reset multiplier to lvl1 on each spin
    EventHandler.dispatchEvent(SlotEvents.START_SPIN);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE_FOR_BB_SPIN);
    appModel.spinStartTime = Util.getCurrentTimeInMili();
    GameProxy.config.buyBonusFeatureId = GameProxy.config.selectedBB;
    GameProxy.config.buyBonusBetMultiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
    await MessageProxy.requestSpinResult(true);
    EventHandler.dispatchEvent(SlotEvents.CREATE_FINAL_REEL_SYMBOLS);
    await Clock.wait(250);
    if (!appModel.isErrorOccurred) {
      StateManager.goToState(STATES.SPIN_RESPONSE_RECEIVED_STATE);
    } else {
      EventHandler.dispatchEvent(SlotEvents.RESET_REEL_FOR_ERROR);
    }
  }
}

export const BBSpinStartState = new BBSpinStartStateCommand();
