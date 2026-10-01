import { appModel } from '@core/models/services/AppModelService';

// The one place that knows the shape of this game's spin/feature response. corelib fills
// appModel.featureResult from featureResults[last] - for a base spin, a respin round and the
// unfinished payload alike - and everything the respin feature needs hangs off its featureData,
// not off featureResult itself.

// A cell the feature is holding. value mirrors the multiplier already encoded in the symbol name
// (C4 -> 4); revealSource marks how a cell was filled ('active' for one that landed on a payline).
export interface HoldFieldEntry {
  position: number[];
  symbol: string;
  value?: number;
  revealSource?: string;
}

// A symbol the trigger turns into a collectable one, revealed after the grid has settled.
export interface MetamorphicSymbol {
  position: number[];
  symbol: string;
  value?: number;
}

export interface ModifierMultiplier {
  position: number[];
  multiplier: number;
}

// How the feature was triggered. addCount matches metamorphicSymbolPosition.length, so the
// positions are what the reveal actually walks.
export interface TriggerAnimation {
  metamorphic?: boolean;
  addCount?: number;
}

// What a held mystery symbol turned out to be. Sent only on the round that closes the feature -
// mysteries resolve at the end, not as they land.
export interface MysteryRevealEntry {
  position: number[];
  symbol: string;
  value?: number;
}

export interface RespinFeatureData {
  holdField?: HoldFieldEntry[];
  modifierRow?: string[];
  modifierMultipliers?: ModifierMultiplier[];
  metamorphicSymbolPosition?: MetamorphicSymbol[];
  triggerAnimation?: TriggerAnimation;
  mysteryPositions?: number[][];
  mysteryReveals?: MysteryRevealEntry[];
}

// A cell the backend is holding sticky. It rides on the init response rather than on a spin:
// stickiness outlives a finished round, so it is not part of unfinishedInfo.
export interface StickyCell {
  position: number[];
  symbol: string;
}

// A lock only holds for the bet and line count it was made at, so the backend sends both with the
// cells and the game puts them back before the UI is built.
export interface StickyState {
  cells?: StickyCell[];
  betAmount?: number;
  activePaylines?: number;
}

// Whatever was still locked when the player last left. Undefined for a fresh session.
export function getStickyState(): StickyState | undefined {
  return appModel.gameData?.progressData?.stickyState;
}

export function getInitialStickyCells(): StickyCell[] {
  return getStickyState()?.cells ?? [];
}

function featureData(): RespinFeatureData {
  return appModel.featureResult?.featureData ?? {};
}

// Empty outside the feature: an ordinary spin sends no featureResults at all.
export function getHoldField(): HoldFieldEntry[] {
  return featureData().holdField ?? [];
}

// How many cells the feature is holding, which is what a respin round is judged on.
export function getCollectedCount(): number {
  return getHoldField().length;
}

// One symbol per top-panel column. Undefined until the spin that triggers the feature.
export function getModifierRow(): string[] | undefined {
  return featureData().modifierRow;
}

export function getModifierMultipliers(): ModifierMultiplier[] {
  return featureData().modifierMultipliers ?? [];
}

// The symbols the trigger converts. Gated on triggerAnimation.metamorphic so a response that
// carries positions for some other reason can't start the coin shower.
export function getMetamorphicSymbols(): MetamorphicSymbol[] {
  if (!featureData().triggerAnimation?.metamorphic) return [];
  return featureData().metamorphicSymbolPosition ?? [];
}

// Empty on every round but the one that closes the feature.
export function getMysteryReveals(): MysteryRevealEntry[] {
  return featureData().mysteryReveals ?? [];
}

// The stop matrix, as corelib reads it off the spin result. A respin round's response leaves
// gameResult null, so this is undefined there and the grid is rebuilt from holdField instead -
// the two agree cell for cell, a round's reelView being its held cells over blanks.
export function getStopGrid(): string[][] | undefined {
  return appModel.getReelsView();
}

// The respins the feature opens on. Readable only on the spin that triggers it, where corelib
// keeps the whole result: a respin round's response carries its own count, but corelib keeps only
// featureResults[last] for a feature round, so from here there is nothing to read. Rounds are
// judged locally instead, in JCRespinState.
export function getGrantedRespins(): number | undefined {
  return appModel.getSpinResult()?.pendingFeature;
}
