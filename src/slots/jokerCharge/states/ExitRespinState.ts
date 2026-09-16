import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { JCEvents } from '../events/JCEvents';

// Outro state - mirrors corelib's ExitFreespinsState. Releases the grid back to normal line-based
// row activity (see JCLinesState.isRowActive()) and resumes the base-game flow. Total feature win
// (appModel.fsInfo.totalFreespinWinAmount - generic despite the name, see CheckRespinState) is
// whatever presentation this game's ShowSpinWinState/UI already renders off the stored gameResult;
// no separate popup wired here yet.
class ExitRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    // Restores the base-game layout and clears respinActive, so the next spin's settle goes back
    // through the normal SpinStoppedState pipeline instead of CheckRespinState.
    EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, { active: false });
    EventHandler.dispatchEvent(SlotEvents.ENABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_BALANCE);
    StateManager.next();
  }
}

export const ExitRespinState = new ExitRespinStateCommand();
