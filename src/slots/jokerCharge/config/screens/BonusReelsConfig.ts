import { BonusReelsContainer } from '@slots/jokerCharge/views/slot/BonusReelsContainer';

// One entry per column, each a key in BONUS_SYMBOLS_DATA.
const INITIAL_REEL: string[] = ['Blank', 'Blank', 'Blank'];

export const BONUS_REELS_CONFIG: any = {
  name: 'bonusReelsContainer',
  type: 'Comp',
  class: BonusReelsContainer,
  // The top panel's centre: its art is 2211x347 anchored top-left at (0, -82) and drawn at 0.65.
  x: 719,
  y: 31,
  // BONUS_TRIGGER_LAYOUT raises this alongside topPanelBg/topPanelFrame.
  alpha: 0,
  data: {
    columns: 3,
    symbolWidth: 460,
    symbolHeight: 180,
    // reel_sym_add's tiles are 2x the sheet art the panel uses at 0.65, so half that lands them
    // just over the mask and keeps the cell edges covered.
    symbolScale: 0.325,
    reelGap: 0,
    spinStartGap: 0,
    stopGap: 0,
    spinSpeedMultiplier: 0.5,
    initialReel: INITIAL_REEL,
  },
};
