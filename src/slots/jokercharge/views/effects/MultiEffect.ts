import { MULTI_SYMBOL_NAME, SUPER_MULTI_SYMBOL_NAME } from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep } from './EffectSteps';

// Multi (MU), for the one column it landed on.
//
// A Super-Multi anywhere lights every column at once, so this stands down when one is on the
// panel - see SuperMultiEffect.
export function resolveMultiStepForColumn(
  container: HoldNWinReelsContainer,
  modifierRow: string[],
  column: number,
): EffectStep[] {
  if (modifierRow[column] !== MULTI_SYMBOL_NAME) return [];
  if (modifierRow.includes(SUPER_MULTI_SYMBOL_NAME)) return [];

  return [(done) => container.playColumnEffects([column], done)];
}
