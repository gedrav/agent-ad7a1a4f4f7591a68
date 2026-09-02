import { HoldNWinReelsContainer } from '@slots/jokerCharge/views/slot/HoldNWinReelsContainer';

// Starting grid, column-major (INITIAL_REEL[column][row]) - column 0 is the leftmost reel, row 0
// is its top cell. Edit these directly to try out different starting layouts; each value must be
// a valid key in config/SymbolsConfig.ts's SYMBOLS_DATA.
const INITIAL_REEL: string[][] = [
  ['cor-1x', 'Blanks', 'major'], // column 0
  ['cor-3x', 'Blanks', 'boost'], // column 1
  ['cor-5x', 'minor', 'mystery'], // column 2
];

// TODO: rows/columns/symbolWidth/symbolHeight/reelGap/rowGap below are placeholder values.
// setSticky() still isn't called from anywhere. spin()/stopSpin() ARE wired now, but only to
// HoldNWinReelsContainer's own simulateSpinResponse() - a setTimeout standing in for a real BE
// round-trip with a random dummy grid (see HoldNWinReelsContainer.ts). Once the actual Hold & Win
// spin-response shape is finalized on the BE, replace that with a real request and add whatever
// state/command decides sticky positions (see responsetemp/Response.ts for the rough shape
// expected today - "grid", "holdField", "triggerAnimation" - but treat that as unconfirmed until
// the BE work lands).
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
    initialReel: INITIAL_REEL,
  },
};
