import { SUPER_MULTI_SYMBOL_NAME } from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep, everyColumn } from './EffectSteps';

// Super-Multi (SMU). Anywhere on the panel it lights every column at once, in a single beat,
// replacing the per-column Multi effect rather than adding to it - see MultiEffect.
export function resolveSuperMultiSteps(container: HoldNWinReelsContainer, modifierRow: string[]): EffectStep[] {
  if (!modifierRow.includes(SUPER_MULTI_SYMBOL_NAME)) return [];

  return [(done) => container.playColumnEffects(everyColumn(modifierRow), done)];
}
