import { ActionCommand } from '@core/commands/core/ActionCommand';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class ShowBBLowBalanceErrorCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    const obj: any = {};
    obj.title = Util.getContent('infoText');
    obj.message = Util.getContent('BBLowBalanceError');
    EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
  }
}

export const ShowBBLowBalanceErrorCommand = new ShowBBLowBalanceErrorCmd();
