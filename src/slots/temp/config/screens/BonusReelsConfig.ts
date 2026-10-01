import { BonusReelsContainer } from '@slots/temp/views/slot/BonusReelsContainer';

// One entry per column, each a key in BONUS_SYMBOLS_DATA.
const INITIAL_REEL: string[] = ['Blank', 'Blank', 'Blank'];

export const BONUS_REELS_CONFIG: any = {
  name: 'bonusReelsContainer',
  type: 'Comp',
  class: BonusReelsContainer,
  // The top panel's centre: its art is 2211x347 anchored top-left at (0, -82) and drawn at 0.65.
  x: 719,
  y: 45,
  // BONUS_TRIGGER_LAYOUT shows this alongside topPanelBg/topPanelFrame. Hidden rather than
  // transparent: a whole reel set at alpha 0 still renders every frame.
  visible: false,
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
    minSpinDuration: 2000,
    minSpinDurationTurbo: 750,
    spinSpeedMultiplier: 0.5,
    initialReel: INITIAL_REEL,
  },
};
