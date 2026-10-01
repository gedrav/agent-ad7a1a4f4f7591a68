import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { resolveChargedSteps } from './ChargedEffect';
import { EffectStep } from './EffectSteps';
import { resolveMultiSteps } from './MultiEffect';
import { resolveSuperChargedSteps } from './SuperChargedEffect';
import { resolveSuperMultiSteps } from './SuperMultiEffect';

// Everything the top-panel row plays, in the order it plays: the charge effects first, then the
// multipliers' own. Each feature decides for itself whether the row calls for it, including
// whether its super version has taken over, so adding or changing one is a single file.
export function resolveModifierSteps(container: HoldNWinReelsContainer, modifierRow: string[]): EffectStep[] {
  return [
    ...resolveSuperChargedSteps(container, modifierRow),
    ...resolveChargedSteps(container, modifierRow),
    ...resolveSuperMultiSteps(container, modifierRow),
    ...resolveMultiSteps(container, modifierRow),
  ];
}
