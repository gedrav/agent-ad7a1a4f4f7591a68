import { ActionCommand } from '@core/commands/core/ActionCommand';
import { loadGameRulesPanel } from '@common/panel/ts/SlotRuleLoader';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

class ShowGameRulesCmd extends ActionCommand {
  public execute(data: any = null) {
    super.execute(data);
    if (data === 'info_button') {
      WrapperProxy.postActivityEvent('ingame_casino_info_button');
    } else {
      WrapperProxy.postActivityEvent('ingame_casino_menu_click', { value: 'game_rules' });
    }
    GameProxy.config.exterPageOpened = true;
    EventHandler.dispatchEvent(SlotEvents.HIDE_MENU);
    loadGameRulesPanel();
  }
}

export const ShowGameRulesCommand = new ShowGameRulesCmd();
