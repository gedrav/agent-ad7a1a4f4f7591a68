import { BonusReelsContainer } from '@slots/jokerCharge/views/slot/BonusReelsContainer';

// One entry per column. Each value must be a key in config/BonusSymbolsConfig.ts's
// BONUS_SYMBOLS_DATA.
const INITIAL_REEL: string[] = ['Blank', 'Blank', 'Blank'];

export const BONUS_REELS_CONFIG: any = {
  name: 'bonusReelsContainer',
  type: 'Comp',
  class: BonusReelsContainer,
  // Centred on the top panel: top_panel_bg/top_panel_frame are 2211x347 art anchored top-left at
  // (0, -82) and drawn at scale 0.65, so the panel's centre is (2211*0.65/2, -82 + 347*0.65/2).
  x: 719,
  y: 31,
  // Starts hidden like topPanelBg/topPanelFrame do; BONUS_TRIGGER_LAYOUT raises all three to
  // alpha 1 together when the bonus round begins.
  alpha: 0,
  data: {
    columns: 3,
    // 3x460 = 1380 wide, sitting inside the panel's 2211*0.65 = 1437 with a little border either
    // side; 180 tall inside its 347*0.65 = 226.
    symbolWidth: 460,
    symbolHeight: 180,
    // reel_sym_add's tiles are 1427x560, i.e. 2x the top_panel_tile sheet art the panel itself
    // uses at 0.65 - so half that lands them at ~464x182, a hair over the mask so the cell edges
    // stay covered.
    symbolScale: 0.325,
    reelGap: 0,
    spinStartGap: 0,
    stopGap: 0,
    spinSpeedMultiplier: 0.5,
    initialReel: INITIAL_REEL,
  },
};
