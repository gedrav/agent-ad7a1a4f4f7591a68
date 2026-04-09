import { ActionCommand } from '@core/commands/core/ActionCommand';
import { loadGameRulesPanel } from '@common/panel/ts/SlotRuleLoader';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';

class ShowGameRulesCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    try {
      GameProxy.config.exterPageOpened = true;
      loadGameRulesPanel();
      EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
    } catch (error) {
      console.error('Error opening game rules:', error);
      GameProxy.config.exterPageOpened = false;
    }
  }
}

export const ShowGameRulesCommand = new ShowGameRulesCmd();
