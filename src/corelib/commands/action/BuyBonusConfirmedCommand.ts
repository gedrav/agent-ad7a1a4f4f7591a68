import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { appModel } from '@core/models/services/AppModelService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { GameProxy } from '@core/models/GameConfigProxy';
import { ShowLowBalanceErrorCommand } from '@core/commands/action/ShowLowBalanceErrorCommand';
import { ShowBBLowBalanceErrorCommand } from '@core/commands/action/ShowBBLowBalanceErrorCommand';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class BuyBonusConfirmedCmd extends ActionCommand {
  public async execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.HIDE_BUY_BONUS_VIEW);

    if (appModel.getIsBBSpinStartPossible(GameProxy.config.selectedBB)) {
      const betAmount = appModel.getTotalBet() * appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
      WrapperProxy.postActivityEvent('ingame_casino_buybonus_buy', { bet_amount: betAmount });
      StateManager.goToState(STATES.BB_SPIN_START_STATE);
    } else {
      const action: ActionCommand = ShowBBLowBalanceErrorCommand;
      action?.execute(null, this);
    }
  }
}

export const BuyBonusConfirmedCommand = new BuyBonusConfirmedCmd();
