import BonusSymbol from '@game/views/slot/BonusSymbol';
import BoostSymbol from '@game/views/slot/BoostSymbol';
import MysterySymbol from '@game/views/slot/MysterySymbol';

// Asset mapping confirmed against the real spine files:
// bag_collect -> boost, bonus_sym (skins 'gold'/'blue') -> cor-Nx bonus symbols,
// belt -> mini, boot -> minor, mask -> major, mystery_back/mystery_front -> mystery (+ jackpot),
// Chain_lock_sym -> sticky overlay (applied via GridReelSymbol.setSticky, not a pool entry).
// Multi/Super-Multi/Charged/Super-charged (charge row) assets not identified yet.

// bonus_sym only has idle/idle_active/landing/win - no appear/collect. BonusSymbol sets the
// gold/blue skin itself based on multiplier, so no static `skin` field here.
const BONUS_ANIM_FIELDS = { idleAnim: 'idle', landingAnim: 'landing', winAnim: 'win' };
// bag_collect has appear/collect/idle/landing - driven by BoostSymbol's playLandSequence.
const BOOST_ANIM_FIELDS = { appearAnim: 'appear', collectAnim: 'collect', idleAnim: 'idle', landingAnim: 'landing' };
// belt/boot/mask confirmed idle/landing/win.
const JACKPOT_ANIM_FIELDS = { idleAnim: 'idle', landingAnim: 'landing', winAnim: 'win' };
// TODO: unconfirmed - placeholder vocabulary until the charge-row assets are identified.
const CHARGE_ROW_ANIM_FIELDS = { idleAnim: 'idle', landingAnim: 'landing', winAnim: 'win' };

export const GRID_SYMBOLS: Record<string, any> = {
  'cor-1x': { name: 'cor-1x', spineName: 'bonus_sym', ...BONUS_ANIM_FIELDS },
  'cor-2x': { name: 'cor-2x', spineName: 'bonus_sym', ...BONUS_ANIM_FIELDS },
  'cor-3x': { name: 'cor-3x', spineName: 'bonus_sym', ...BONUS_ANIM_FIELDS },
  'cor-4x': { name: 'cor-4x', spineName: 'bonus_sym', ...BONUS_ANIM_FIELDS },
  'cor-5x': { name: 'cor-5x', spineName: 'bonus_sym', ...BONUS_ANIM_FIELDS },
  'sticky cor': { name: 'sticky cor', spineName: 'bonus_sym', ...BONUS_ANIM_FIELDS },

  mini: { name: 'mini', spineName: 'belt', skin: 'default', ...JACKPOT_ANIM_FIELDS },
  minor: { name: 'minor', spineName: 'boot', skin: 'default', ...JACKPOT_ANIM_FIELDS },
  major: { name: 'major', spineName: 'mask', skin: 'default', ...JACKPOT_ANIM_FIELDS },
  boost: { name: 'boost', spineName: 'bag_collect', skin: 'default', ...BOOST_ANIM_FIELDS },

  mystery: { name: 'mystery', backSpine: 'mystery_back', frontSpine: 'mystery_front' },
  'mystery jackpot': { name: 'mystery jackpot', backSpine: 'mystery_back', frontSpine: 'mystery_front' },
  'sticky mystery': { name: 'sticky mystery', backSpine: 'mystery_back', frontSpine: 'mystery_front' },
  'sticky mystery jackpot': { name: 'sticky mystery jackpot', backSpine: 'mystery_back', frontSpine: 'mystery_front' },

  Blanks: { name: 'Blanks' },
};

// Separate from GRID_SYMBOLS - these land on the special top row (ChargeRowView, not built
// yet), not the main 3x3 grid.
export const CHARGE_ROW_SYMBOLS: Record<string, any> = {
  Multi: { name: 'Multi', spineName: 'Multi', skin: 'default', ...CHARGE_ROW_ANIM_FIELDS },
  'Super-Multi': { name: 'Super-Multi', spineName: 'Super-Multi', skin: 'default', ...CHARGE_ROW_ANIM_FIELDS },
  Charged: { name: 'Charged', spineName: 'Charged', skin: 'default', ...CHARGE_ROW_ANIM_FIELDS },
  'Super-charged': { name: 'Super-charged', spineName: 'Super-charged', skin: 'default', ...CHARGE_ROW_ANIM_FIELDS },
};

export const GRID_SYMBOL_POOL: any[] = Object.values(GRID_SYMBOLS);

// Anything not listed here falls back to GridReelView's defaultSymbolClass (GridReelSymbol) -
// i.e. mini/minor/major/Blanks need no entry.
export const GRID_SYMBOL_CLASS_MAP: Record<string, any> = {
  'cor-1x': BonusSymbol,
  'cor-2x': BonusSymbol,
  'cor-3x': BonusSymbol,
  'cor-4x': BonusSymbol,
  'cor-5x': BonusSymbol,
  'sticky cor': BonusSymbol,
  boost: BoostSymbol,
  mystery: MysterySymbol,
  'mystery jackpot': MysterySymbol,
  'sticky mystery': MysterySymbol,
  'sticky mystery jackpot': MysterySymbol,
};
