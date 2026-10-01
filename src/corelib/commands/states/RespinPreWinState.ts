import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

export interface RespinRoundAnimationData {
  hold: boolean;
  onComplete: () => void;
}

class RespinPreWinStateCommand extends StateCommand {
  private advanced = false;

  public async execute(data: any = null) {
    super.execute(data);
    this.advanced = false;
    const round: RespinRoundAnimationData = { hold: false, onComplete: () => this.advance() };
    EventHandler.dispatchEvent(SlotEvents.SHOW_RESPIN_ROUND_ANIMATION, round);
    if (!round.hold) this.advance();
  }

  public doNextStep(data: any = null) {
    super.doNextStep(data);
    this.advance();
  }

  private advance(): void {
    if (this.advanced) return;
    this.advanced = true;
    StateManager.goToState(STATES.CHECK_RESPIN_STATE);
  }
}

export const RespinPreWinState = new RespinPreWinStateCommand();
