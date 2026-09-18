import { Util } from '@core/utils/UtilService';

// Top-panel symbols for the bonus round (see BonusReelsContainer) - a separate set from the main
// grid's SYMBOLS_DATA. All five live in the one reel_sym_add rig and differ only by skin: that
// rig's single 'static' animation is empty and it declares no default skin, so a symbol *is* its
// skin's setup pose. Both picking a symbol and blurring it are plain setSkin() swaps, which is why
// BonusReelSymbol needs none of JCReelSymbol's landing/idle/win machinery.
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
  // Blur deliberately reuses the static skin, as specified - reel_sym_add does carry a
  // top_panel_tile_lightning_blur skin if the blank should blur like the rest while spinning.
  Blank: { staticSkin: 'top_panel_tile_lightning', blurSkin: 'top_panel_tile_lightning' },
};

export const BLANK_BONUS_SYMBOL_NAME = 'Blank';
// Weight for getRandomBonusSymbolName() below - out of 100.
export const BONUS_BLANK_PERCENT = 50;
const NON_BLANK_BONUS_SYMBOL_NAMES = Object.keys(BONUS_SYMBOLS_DATA).filter((name) => name !== BLANK_BONUS_SYMBOL_NAME);

// Mirrors SymbolsConfig.getRandomSymbolName(): fills the symbols that scroll past mid-spin, where
// what shows is throwaway filler rather than part of the result.
export function getRandomBonusSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BONUS_BLANK_PERCENT;
  return isBlank
    ? BLANK_BONUS_SYMBOL_NAME
    : NON_BLANK_BONUS_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_BONUS_SYMBOL_NAMES.length - 1)];
}
