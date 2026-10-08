import { CHARGED_SYMBOL_NAME, SUPER_CHARGED_SYMBOL_NAME } from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep, playTogether } from './EffectSteps';

// Charged (CH), for the one column it landed on: lights the two borders flanking that column and
// sends a triangle up it, the two playing together, then takes every cash symbol in that column
// one step up the charge ladder.
//
// A Super-Charged anywhere covers the whole grid on its own, so this stands down when one is on
// the panel - see SuperChargedEffect.
export function resolveChargedStepForColumn(
  container: HoldNWinReelsContainer,
  modifierRow: string[],
  column: number,
): EffectStep[] {
  if (modifierRow[column] !== CHARGED_SYMBOL_NAME) return [];
  if (modifierRow.includes(SUPER_CHARGED_SYMBOL_NAME)) return [];

  return [
    (done) =>
      playTogether(
        done,
        (next) => container.playBorderEffects([column, column + 1], next),
        (next) => container.playTriangleEffects([column], next),
      ),
    (done) => container.chargeColumns([column], done),
  ];
}
