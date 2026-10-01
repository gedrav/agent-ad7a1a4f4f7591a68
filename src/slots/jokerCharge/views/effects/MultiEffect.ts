import { MULTI_SYMBOL_NAME, SUPER_MULTI_SYMBOL_NAME } from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep } from './EffectSteps';

// Multi (MU). Each one fires on its own column, one step at a time.
//
// A Super-Multi anywhere lights every column at once, so this stands down when one is on the
// panel - see SuperMultiEffect.
export function resolveMultiSteps(container: HoldNWinReelsContainer, modifierRow: string[]): EffectStep[] {
  if (modifierRow.includes(SUPER_MULTI_SYMBOL_NAME)) return [];

  return modifierRow.reduce<EffectStep[]>((steps, symbol, column) => {
    if (symbol === MULTI_SYMBOL_NAME) {
      steps.push((done) => container.playColumnEffects([column], done));
    }
    return steps;
  }, []);
}
