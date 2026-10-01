import { RespinSpinStartStateCommand } from '@core/commands/states/RespinSpinStartState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { Clock } from '@core/utils/Clock';
import { JCEvents } from '../events/JCEvents';
import { isFirstRespinRound, registerRespinRound } from '../models/JCRespinState';
import { getCollectedCount } from '../models/JCSpinData';
import { ModifierEffectsData } from '../views/slot/GameSlotMachineView';

// Lets the round that just settled be read before the reels move again.
const ROUND_GAP = 500;

class JCRespinSpinStartStateCommand extends RespinSpinStartStateCommand {
  protected async beforeSpin(): Promise<void> {
    // Read before registerRespinRound below, which is what clears it.
    const firstRound = isFirstRespinRound();
    await Clock.wait(ROUND_GAP);
    // Judges the round that just finished, so the counter moves as this spin starts.
    EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, registerRespinRound(getCollectedCount()));
    // The triggering spin's top-panel row has been on screen since the transition but has never
    // played. It runs here, once, after the intro and before the reels move.
    if (firstRound) await this.playModifierEffects();
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
