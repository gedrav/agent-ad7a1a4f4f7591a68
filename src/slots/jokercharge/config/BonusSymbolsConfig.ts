import { Util } from '@core/utils/UtilService';

// Top-panel symbols for the bonus round, separate from the main grid's SYMBOLS_DATA. All five
// share the reel_sym_add rig and differ only by skin - its one animation is empty and it declares
// no default skin, so a symbol is just its skin's setup pose.
export const BONUS_SPINE_NAME = 'reel_sym_add';

export interface BonusSymbolData {
  staticSkin: string;
  blurSkin: string;
}

// Keyed by the backend's symbol names, as sent in modifierRow.
export const BONUS_SYMBOLS_DATA: Record<string, BonusSymbolData> = {
  MU: { staticSkin: 'Multi_top_sym', blurSkin: 'Multi_top_sym_blur' },
  SMU: { staticSkin: 'Super_multi_top_sym', blurSkin: 'Super_multi_top_sym_blur' },
  CH: { staticSkin: 'Charge_top_sym', blurSkin: 'Charge_top_sym_blur' },
  SCH: { staticSkin: 'Super_charge_top_sym', blurSkin: 'Super_charge_top_sym_blur' },
  // Blur reuses the static skin by choice; a top_panel_tile_lightning_blur skin does exist.
  Blank: { staticSkin: 'top_panel_tile_lightning', blurSkin: 'top_panel_tile_lightning' },
};

// The backend has no name of its own for an empty top-panel cell, so this one stays local: see
// resolveBonusSymbolName, which maps anything unrecognised onto it.
export const BLANK_BONUS_SYMBOL_NAME = 'Blank';
export const MULTI_SYMBOL_NAME = 'MU';
export const SUPER_MULTI_SYMBOL_NAME = 'SMU';
export const CHARGED_SYMBOL_NAME = 'CH';
export const SUPER_CHARGED_SYMBOL_NAME = 'SCH';
// Out of 100.
export const BONUS_BLANK_PERCENT = 50;
const NON_BLANK_BONUS_SYMBOL_NAMES = Object.keys(BONUS_SYMBOLS_DATA).filter((name) => name !== BLANK_BONUS_SYMBOL_NAME);

// The backend's modifierRow uses the main grid's blank name ('BL'), and anything it sends that
// isn't a known top-panel symbol falls back to the blank tile rather than rendering nothing.
export function resolveBonusSymbolName(name: string): string {
  return BONUS_SYMBOLS_DATA[name] ? name : BLANK_BONUS_SYMBOL_NAME;
}

// Filler for the symbols that scroll past mid-spin.
export function getRandomBonusSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BONUS_BLANK_PERCENT;
  return isBlank
    ? BLANK_BONUS_SYMBOL_NAME
    : NON_BLANK_BONUS_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_BONUS_SYMBOL_NAMES.length - 1)];
}
