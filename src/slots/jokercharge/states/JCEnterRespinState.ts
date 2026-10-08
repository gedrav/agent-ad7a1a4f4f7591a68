import { EnterRespinStateCommand } from '@core/commands/states/EnterRespinState';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { StateManager } from '@core/states/StateManagerService';
import { JCEvents } from '../events/JCEvents';
import { startRespinSession, TOTAL_RESPINS } from '../models/JCRespinState';
import { getGrantedRespins, getMetamorphicSymbols, MetamorphicSymbol } from '../models/JCSpinData';
import { MetamorphicRevealData, TriggerWinData } from '../views/slot/GameSlotMachineView';

class JCEnterRespinStateCommand extends EnterRespinStateCommand {
  // A metamorphic trigger showers coins and brings its symbols in one by one, then the active
  // line celebrates - late enough that the symbols the shower just brought in join in.
  protected async playTriggerPresentation(): Promise<void> {
    const metamorphic: MetamorphicSymbol[] = getMetamorphicSymbols();
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
        // The triggering spin carries the count the feature opens on.
        const remaining = startRespinSession(getGrantedRespins() ?? TOTAL_RESPINS);
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
