import { ActionCommand } from '@core/commands/core/ActionCommand';
import { loadGameRulesPanel } from '@common/panel/ts/SlotRuleLoader';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';

class ShowGameRulesCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    GameProxy.config.exterPageOpened = true;
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
    setTimeout(this.loadRules.bind(this), 50);
  }

  protected loadRules() {
    loadGameRulesPanel();
  }
}

export const ShowGameRulesCommand = new ShowGameRulesCmd();
