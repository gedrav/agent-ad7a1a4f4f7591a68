import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';

export interface RespinRoundAnimationData {
  // A listener that needs to hold the round sets this true and calls onComplete when it's done.
  // Left false, the round carries on immediately.
  hold: boolean;
  onComplete: () => void;
}

// Runs once a respin round's reels have settled and before CheckRespinState decides whether to
// spin again - the respin equivalent of PreSpinWinState, and the place for per-round animations.
// Games hook SHOW_RESPIN_ROUND_ANIMATION; StateManager.doNextStep() resumes it either way.
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

  // Guarded so a listener calling onComplete after the round already moved on can't advance twice.
  private advance(): void {
    if (this.advanced) return;
    this.advanced = true;
    StateManager.goToState(STATES.CHECK_RESPIN_STATE);
  }
}

export const RespinPreWinState = new RespinPreWinStateCommand();
