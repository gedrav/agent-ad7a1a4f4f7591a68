import { Util } from '@core/utils/UtilService';

// Top-panel symbols for the bonus round, separate from the main grid's SYMBOLS_DATA. All five
// share the reel_sym_add rig and differ only by skin - its one animation is empty and it declares
// no default skin, so a symbol is just its skin's setup pose.
export const BONUS_SPINE_NAME = 'reel_sym_add';

export interface BonusSymbolData {
  staticSkin: string;
  blurSkin: string;
}

export const BONUS_SYMBOLS_DATA: Record<string, BonusSymbolData> = {
  Multi: { staticSkin: 'Multi_top_sym', blurSkin: 'Multi_top_sym_blur' },
  'Super-Multi': { staticSkin: 'Super_multi_top_sym', blurSkin: 'Super_multi_top_sym_blur' },
  Charged: { staticSkin: 'Charge_top_sym', blurSkin: 'Charge_top_sym_blur' },
  'Super-charged': { staticSkin: 'Super_charge_top_sym', blurSkin: 'Super_charge_top_sym_blur' },
  // Blur reuses the static skin by choice; a top_panel_tile_lightning_blur skin does exist.
  Blank: { staticSkin: 'top_panel_tile_lightning', blurSkin: 'top_panel_tile_lightning' },
};

export const BLANK_BONUS_SYMBOL_NAME = 'Blank';
// Out of 100.
export const BONUS_BLANK_PERCENT = 50;
const NON_BLANK_BONUS_SYMBOL_NAMES = Object.keys(BONUS_SYMBOLS_DATA).filter((name) => name !== BLANK_BONUS_SYMBOL_NAME);

// Filler for the symbols that scroll past mid-spin.
export function getRandomBonusSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BONUS_BLANK_PERCENT;
  return isBlank
    ? BLANK_BONUS_SYMBOL_NAME
    : NON_BLANK_BONUS_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_BONUS_SYMBOL_NAMES.length - 1)];
}
