import { StateCommand } from '@core/commands/core/StateCommand';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { JCEvents } from '../events/JCEvents';
import { startRespinSession } from '../models/JCRespinState';
import { MetamorphicRevealData, TriggerWinData } from '../views/slot/GameSlotMachineView';
import { MetamorphicSymbol } from '../views/slot/HoldNWinReelsContainer';

// The feature-type guard is load-bearing: CheckFeatureStateV2's final `else { StateManager.next()
// }` (an ordinary spin, no feature) falls through onto this state, so without it every non-feature
// spin would enter the respin feature.
class EnterRespinStateCommand extends StateCommand {
  public async execute(data: any = null) {
    super.execute(data);
    if (appModel.getNextFeatureType() !== CONSTANTS.FEATURE_TYPE_RESPIN) {
      StateManager.goToState(STATES.COMPLETE_GAMEROUND_STATE);
      return;
    }
    EventHandler.dispatchEvent(SlotEvents.DISABLE_CONTROLPANEL);
    EventHandler.dispatchEvent(SlotEvents.CLEAR_WINS);
    const metamorphic: MetamorphicSymbol[] = appModel.getSpinResult()?.metamorphicSymbolPosition ?? [];
    if (metamorphic.length) {
      EventHandler.dispatchEvent(JCEvents.PLAY_COINS_ANIMATION);
      await this.revealMetamorphicSymbols(metamorphic);
    }
    // The beat before the wipe, and late enough that the symbols the shower just brought in
    // celebrate with the rest of the line.
    await this.playTriggerWins();
    // Both happen at the wipe's midpoint, hidden behind it: the layout swaps (which flips
    // respinActive, routing later rounds into CheckRespinState) and next() shows the intro.
    EventHandler.dispatchEvent(JCEvents.PLAY_TRANSITION, {
      onHalfway: () => {
        EventHandler.dispatchEvent(JCEvents.SET_BONUS_TRIGGER_LAYOUT, { active: true });
        // Seeded with whatever the triggering spin already collected, so the first round can tell
        // a new symbol from one that was already there.
        const remaining = startRespinSession(appModel.featureResult?.holdField?.length ?? 0);
        EventHandler.dispatchEvent(JCEvents.UPDATE_RESPIN_COUNTER, remaining);
        StateManager.next();
      },
    });
  }

  // Resolves once the last active-line symbol has finished its win animation, or straight away if
  // nothing is listening.
  private playTriggerWins(): Promise<void> {
    return new Promise((resolve) => {
      const request: TriggerWinData = { hold: false, onComplete: () => resolve() };
      EventHandler.dispatchEvent(JCEvents.PLAY_TRIGGER_WIN_ANIMATION, request);
      if (!request.hold) resolve();
    });
  }

  // Resolves once the last symbol has landed, or straight away if nothing is listening.
  private revealMetamorphicSymbols(entries: MetamorphicSymbol[]): Promise<void> {
    return new Promise((resolve) => {
      const request: MetamorphicRevealData = { entries, hold: false, onComplete: () => resolve() };
      EventHandler.dispatchEvent(JCEvents.PLAY_METAMORPHIC_SYMBOLS, request);
      if (!request.hold) resolve();
    });
  }
}

export const EnterRespinState = new EnterRespinStateCommand();
