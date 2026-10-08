import { RespinSpinStartStateCommand } from '@core/commands/states/RespinSpinStartState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { Clock } from '@core/utils/Clock';
import { JCEvents } from '../events/JCEvents';
import { isFirstRespinRound, spendRespin } from '../models/JCRespinState';
import { ModifierEffectsData } from '../views/slot/GameSlotMachineView';

// Lets the round that just settled be read before the reels move again.
const ROUND_GAP = 500;

class JCRespinSpinStartStateCommand extends RespinSpinStartStateCommand {
  protected async beforeSpin(): Promise<void> {
    await Clock.wait(ROUND_GAP);
    // The triggering spin's top-panel row has been on screen since the transition but has never
    // played. It runs here, once, after the intro and before the reels move.
    if (isFirstRespinRound()) await this.playModifierEffects();
    // Last, so the count drops as the reels actually start rather than ahead of the effects above.
    // A symbol landing gives it back - see HoldNWinReelsContainer.onRespinCellLanded.
    EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, spendRespin());
  }

  // Resolves once the last effect has finished, or straight away if nothing is listening.
  private playModifierEffects(): Promise<void> {
    return new Promise((resolve) => {
      const request: ModifierEffectsData = { hold: false, onComplete: () => resolve() };
      EventHandler.dispatchEvent(JCEvents.PLAY_MODIFIER_EFFECTS, request);
      if (!request.hold) resolve();
    });
  }
}

export const RespinSpinStartState = new JCRespinSpinStartStateCommand();
