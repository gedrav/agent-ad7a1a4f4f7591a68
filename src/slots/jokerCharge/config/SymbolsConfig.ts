import { Util } from '@core/utils/UtilService';

export interface JCSymbolData {
  name: string;
  spineName?: string;
  skin?: string;
  idleAnim?: string;
  staticAnim?: string;
  blurAnim?: string;
  winAnim?: string;
  landingAnim?: string;
  multiplierTextConfig?: any;
  // Fixed, absolute scale for this symbol in a Hold & Win cell (see HoldNWinReel.applySymbolScale).
  // Omit to auto-fit the symbol inside the cell instead.
  cellScale?: number;
}

const MULTIPLIER_TEXT_STYLE = {
  fontFamily: 'commonFont',
  fontWeight: 700,
  fontSize: 60,
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 4 },
};

function bonusSymbolData(multiplier: number): JCSymbolData {
  return {
    name: `cor-${multiplier}x`,
    spineName: 'hat',
    // cor-5x is the top-tier bonus symbol and gets the blue skin, every other cor-Nx uses gold
    skin: multiplier === 5 ? 'blue' : 'gold',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.6,
    multiplierTextConfig: {
      name: 'multiplierVal',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      style: MULTIPLIER_TEXT_STYLE,
    },
  };
}

export const SYMBOLS_DATA: Record<string, JCSymbolData> = {
  'cor-1x': bonusSymbolData(1),
  'cor-2x': bonusSymbolData(2),
  'cor-3x': bonusSymbolData(3),
  'cor-4x': bonusSymbolData(4),
  'cor-5x': bonusSymbolData(5),
  boost: {
    name: 'boost',
    spineName: 'bag_collect',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.6,
  },
  mini: {
    name: 'mini',
    spineName: 'belt',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.6,
  },
  minor: {
    name: 'minor',
    spineName: 'boot',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.6,
  },
  major: {
    name: 'major',
    spineName: 'mask',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.6,
  },
  // Rendered from two spines (see JCMysterySymbolModifier) - spineName here drives the back
  // layer, the front layer is the extra one.
  mystery: {
    name: 'mystery',
    spineName: 'mystery_back',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.3,
  },
  'mystery jackpot': {
    name: 'mystery jackpot',
    spineName: 'mystery_back',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.3,
  },
  // No spine - renders as a placeholder rectangle instead (see JCBlanksSymbolModifier).
  Blanks: {
    name: 'Blanks',
  },
};

const BLANKS_NAME = 'Blanks';
// Weight for getRandomSymbolName() below - out of 100.
export const BLANKS_PERCENT = 50;
const NON_BLANK_SYMBOL_NAMES = Object.keys(SYMBOLS_DATA).filter((name) => name !== BLANKS_NAME);

// BLANKS_PERCENT chance of Blanks, otherwise any other symbol uniformly at random. Used wherever
// a placeholder symbol name is needed but there's no real spin result yet.
export function getRandomSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BLANKS_PERCENT;
  return isBlank ? BLANKS_NAME : NON_BLANK_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_SYMBOL_NAMES.length - 1)];
}
