import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

class AutoPlayConfirmBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CANCEL_CLICKED);
    EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CONFIRM_BTN_CLICKED);
  }
}

export const AutoPlayConfirmBtnCommand = new AutoPlayConfirmBtnCmd();
