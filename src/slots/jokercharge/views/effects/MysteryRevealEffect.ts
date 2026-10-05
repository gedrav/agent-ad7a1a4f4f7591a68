import { getMysteryReveals } from '@slots/jokercharge/models/JCSpinData';
import { HoldNWinReelsContainer, MysteryReveal } from '../slot/HoldNWinReelsContainer';
import { toMysteryReelResult } from '../slot/JCMysterySymbolModifier';
import { EffectStep } from './EffectSteps';

// Mystery reveal, one of the beats that close the respin feature.
//
// The backend resolves every held mystery at once, on the round that closes the feature, and sends
// the answers as featureData.mysteryReveals. Nothing before that round carries them, so this step
// is empty for every other round and the feature runs straight past it.
//
// Per cell the order is fixed: the strip lands on the prize, the symbol pops to show it, the
// mystery rig plays its hide animation, the cell swaps to the symbol the backend named, and that
// symbol lands. Every mystery on the grid has been turning since the feature opened, so they all
// spin together and then come to rest one at a time, each finishing its own reveal before the next
// one starts - see HoldNWinReelsContainer.revealMysterySymbols.
export function resolveMysteryRevealSteps(container: HoldNWinReelsContainer): EffectStep[] {
  const reveals = getMysteryReveals();
  if (!reveals.length) return [];

  const entries: MysteryReveal[] = reveals.map(({ position, symbol, value }) => ({
    position,
    result: toMysteryReelResult(symbol, value),
    symbol,
  }));

  return [(done) => container.revealMysterySymbols(entries, done)];
}
