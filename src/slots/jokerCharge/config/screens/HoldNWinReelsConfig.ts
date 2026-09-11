import { HoldNWinReelsContainer } from '@slots/jokerCharge/views/slot/HoldNWinReelsContainer';

// Starting grid, column-major (INITIAL_REEL[column][row]). Each value must be a key in
// config/SymbolsConfig.ts's SYMBOLS_DATA.
const INITIAL_REEL: string[][] = [
  ['cor-1x', 'major', 'mini'], // column 0
  ['Blanks', 'Blanks', 'boost'], // column 1
  ['cor-5x', 'minor', 'Blanks'], // column 2
];

// TODO: rows/columns/symbolWidth/symbolHeight/reelGap/rowGap are placeholders. setSticky() isn't
// called yet; spin()/stopSpin() only run via the dummy simulateSpinResponse() until the real BE
// spin-response is finalized (rough shape in responsetemp/Response.ts - unconfirmed).
export const HOLD_N_WIN_REELS_CONFIG: any = {
  name: 'holdNWinReelsContainer',
  type: 'Comp',
  class: HoldNWinReelsContainer,
  x: 706,
  y: 476,
  data: {
    rows: 3,
    columns: 3,
    symbolWidth: 448,
    symbolHeight: 292,
    reelGap: 15,
    rowGap: 15,
    spinStartGap: 0,
    stopGap: 0,
    minSpinDuration: 2000,
    minSpinDurationTurbo: 750,
    spinSpeedMultiplier: 0.5,
    initialReel: INITIAL_REEL,
  },
};
