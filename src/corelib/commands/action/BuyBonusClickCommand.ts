import { ActionCommand } from '@core/commands/core/ActionCommand';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class BuyBonusClickCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    WrapperProxy.postActivityEvent('ingame_casino_buybonus_open');
    EventHandler.dispatchEvent(SlotEvents.SHOW_BUY_BONUS_VIEW, data.id);
  }
}

export const BuyBonusClickCommand = new BuyBonusClickCmd();
