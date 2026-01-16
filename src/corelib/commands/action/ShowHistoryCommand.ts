import { ActionCommand } from '@core/commands/core/ActionCommand';
import { loadHistoryPanelFirst } from '@common/panel/ts/SlotRuleLoader';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';

class ShowHistoryCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    GameProxy.config.exterPageOpened = true;
    loadHistoryPanelFirst();
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const ShowHistoryCommand = new ShowHistoryCmd();
