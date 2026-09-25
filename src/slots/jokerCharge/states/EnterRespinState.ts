import { EnterRespinStateCommand } from '@core/commands/states/EnterRespinState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { JCEvents } from '../events/JCEvents';
import { startRespinSession } from '../models/JCRespinState';
import { MetamorphicRevealData, TriggerWinData } from '../views/slot/GameSlotMachineView';
import { MetamorphicSymbol } from '../views/slot/HoldNWinReelsContainer';

class JCEnterRespinStateCommand extends EnterRespinStateCommand {
  // A metamorphic trigger showers coins and brings its symbols in one by one, then the active
  // line celebrates - late enough that the symbols the shower just brought in join in.
  protected async playTriggerPresentation(): Promise<void> {
    const metamorphic: MetamorphicSymbol[] = appModel.getSpinResult()?.metamorphicSymbolPosition ?? [];
    if (metamorphic.length) {
      EventHandler.dispatchEvent(JCEvents.PLAY_COINS_ANIMATION);
      await this.revealMetamorphicSymbols(metamorphic);
    }
    await this.playTriggerWins();
  }

  // Both happen at the wipe's midpoint, hidden behind it: the layout swaps (which flips
  // respinActive, routing later rounds into CheckRespinState) and next() shows the intro.
  protected openFeature(): void {
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

export const EnterRespinState = new JCEnterRespinStateCommand();
