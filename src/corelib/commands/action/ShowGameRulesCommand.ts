import { ActionCommand } from '@core/commands/core/ActionCommand';
import { loadGameRulesPanel } from '@common/panel/ts/SlotRuleLoader';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

class ShowGameRulesCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    loadGameRulesPanel();
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
  }
}

export const ShowGameRulesCommand = new ShowGameRulesCmd();
