import { ActionCommand } from '@core/commands/core/ActionCommand';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class ShowLowBalanceErrorCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    const obj: any = {};
    obj.title = Util.getContent('infoText');
    obj.message = Util.getContent('LowBalanceError');
    EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
  }
}

export const ShowLowBalanceErrorCommand = new ShowLowBalanceErrorCmd();
