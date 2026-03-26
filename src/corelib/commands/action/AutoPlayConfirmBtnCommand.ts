import { ActionCommand } from '@core/commands/core/ActionCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

class AutoPlayConfirmBtnCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    const status = appModel.getNextAutoPossible();
    console.log('status', status);
    if (status === 1 && appModel.getIsSpinStartPossible()) {
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CONFIRM_BTN_CLICKED);
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CANCEL_CLICKED);
    } else {
      EventHandler.dispatchEvent(SlotEvents.AUTOPLAY_CANCEL_CLICKED);
      const obj: any = {};
      obj.title = Util.getContent('infoText');
      obj.message = Util.getContent('AutoplayNotPossible');
      EventHandler.dispatchEvent(SlotEvents.SHOW_MESSAGE_POPUP, obj);
    }
  }
}

export const AutoPlayConfirmBtnCommand = new AutoPlayConfirmBtnCmd();
