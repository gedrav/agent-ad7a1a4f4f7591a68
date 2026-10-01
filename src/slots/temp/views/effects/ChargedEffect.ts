import { CHARGED_SYMBOL_NAME, SUPER_CHARGED_SYMBOL_NAME } from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep, playTogether } from './EffectSteps';

// Charged (CH). Each one lights the two borders flanking its own column and sends a triangle up
// that column, the two playing together rather than one after the other, and then takes every cash
// symbol in that column one step up the charge ladder. One pair of steps per Charged symbol, so
// two of them read in turn.
//
// A Super-Charged anywhere covers the whole grid on its own, so this stands down when one is on
// the panel - see SuperChargedEffect.
export function resolveChargedSteps(container: HoldNWinReelsContainer, modifierRow: string[]): EffectStep[] {
  if (modifierRow.includes(SUPER_CHARGED_SYMBOL_NAME)) return [];

  return modifierRow.reduce<EffectStep[]>((steps, symbol, column) => {
    if (symbol === CHARGED_SYMBOL_NAME) {
      steps.push((done) =>
        playTogether(
          done,
          (next) => container.playBorderEffects([column, column + 1], next),
          (next) => container.playTriangleEffects([column], next),
        ),
      );
      steps.push((done) => container.chargeColumns([column], done));
    }
    return steps;
  }, []);
}
