import {
  CHARGED_SYMBOL_NAME,
  MULTI_SYMBOL_NAME,
  SUPER_CHARGED_SYMBOL_NAME,
  SUPER_MULTI_SYMBOL_NAME,
} from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { resolveChargedStepForColumn } from './ChargedEffect';
import { EffectStep } from './EffectSteps';
import { resolveMultiStepForColumn } from './MultiEffect';
import { resolveSuperChargedSteps } from './SuperChargedEffect';
import { resolveSuperMultiSteps } from './SuperMultiEffect';

// Everything the top-panel row plays, in the order its symbols sit left to right: whichever column
// landed first plays its own feature first, then the next column's, and so on - priority follows
// the modifier reel's own symbol sequence, not a fixed feature-type order.
//
// A Super symbol's effect covers the whole grid rather than just its column, so it plays once, in
// the turn of the first column it lands on; a second one (if it ever happens) plays nothing more.
export function resolveModifierSteps(container: HoldNWinReelsContainer, modifierRow: string[]): EffectStep[] {
  let superChargedPlayed = false;
  let superMultiPlayed = false;

  return modifierRow.reduce<EffectStep[]>((steps, symbol, column) => {
    switch (symbol) {
      case SUPER_CHARGED_SYMBOL_NAME:
        if (!superChargedPlayed) {
          superChargedPlayed = true;
          steps.push(...resolveSuperChargedSteps(container, modifierRow));
        }
        break;
      case CHARGED_SYMBOL_NAME:
        steps.push(...resolveChargedStepForColumn(container, modifierRow, column));
        break;
      case SUPER_MULTI_SYMBOL_NAME:
        if (!superMultiPlayed) {
          superMultiPlayed = true;
          steps.push(...resolveSuperMultiSteps(container, modifierRow));
        }
        break;
      case MULTI_SYMBOL_NAME:
        steps.push(...resolveMultiStepForColumn(container, modifierRow, column));
        break;
      default:
        break;
    }
    return steps;
  }, []);
}
