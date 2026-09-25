import { HoldNWinReelsContainer } from '@slots/jokerCharge/views/slot/HoldNWinReelsContainer';

// Starting grid
const INITIAL_REEL: string[][] = [
  ['cor-1x', 'Blanks', 'mini'],
  ['Blanks', 'Blanks', 'Blanks'],
  ['cor-5x', 'mystery jackpot', 'minor'],
];

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
    maskHeight: 285,
    landingOvershoot: 35,
    reelGap: 15,
    rowGap: 30,
    rowOffsetsY: [11, 0, -7],
    spinStartGap: 20,
    stopGap: 20,
    columnEffectScale: 0.65,
    columnEffectOffsetY: 0,
    borderEffectScale: 1.55,
    borderEffectOffsetY: 0,
    anticipationDelay: 1200,
    anticipationSpeedFactor: 0.35,
    minSpinDuration: 1500,
    minSpinDurationTurbo: 750,
    spinSpeedMultiplier: 0.45,
    initialReel: INITIAL_REEL,
  },
};
