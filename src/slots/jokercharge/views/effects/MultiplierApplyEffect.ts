import { isFeatureClosed } from '@slots/jokercharge/models/JCSpinData';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep } from './EffectSteps';

// Spending the multipliers: each badge is paid into the symbol it sits on - see
// HoldNWinReel.applyMultiplierToSymbol.
//
// Runs after the mystery reveal, so a mystery that turned into a cash symbol spends its badge on
// the symbol it became. Gated on the feature closing rather than on badges being present: badges
// are on screen from the round that earned them onwards, so they would otherwise be spent again
// every round.
export function resolveMultiplierApplySteps(container: HoldNWinReelsContainer): EffectStep[] {
  if (!isFeatureClosed()) return [];
  return [(done) => container.applyMultipliersToSymbols(done)];
}
