import { SUPER_CHARGED_SYMBOL_NAME } from '../../config/BonusSymbolsConfig';
import { HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep, everyColumn, playTogether } from './EffectSteps';

// Super-Charged (SCH). Anywhere on the panel it lights the grid's outer edges and sends a triangle
// up every column in one beat, then takes every cash symbol on the grid one step up the charge
// ladder. It replaces the per-column Charged effect rather than adding to it - see ChargedEffect.
export function resolveSuperChargedSteps(container: HoldNWinReelsContainer, modifierRow: string[]): EffectStep[] {
  if (!modifierRow.includes(SUPER_CHARGED_SYMBOL_NAME)) return [];

  const columns = everyColumn(modifierRow);
  return [
    (done) =>
      playTogether(
        done,
        // Border indexes run 0..columns, so these two are the grid's own left and right edges.
        (next) => container.playBorderEffects([0, modifierRow.length], next),
        (next) => container.playTriangleEffects(columns, next),
      ),
    (done) => container.chargeColumns(columns, done),
  ];
}
