import { Util } from '@core/utils/UtilService';

export interface JCSymbolData {
  name: string;
  image?: string;
  spineName?: string;
  skin?: string;
  idleAnim?: string;
  winAnim?: string;
  landingAnim?: string;
  multiplierTextConfig?: any;
  // Fixed, absolute scale for this symbol in a Hold & Win cell (see
  // HoldNWinReel.applySymbolScale) - applied as-is, not combined with the cell's dimensions in
  // any way, so it reads the same regardless of symbolWidth/symbolHeight. Omit to auto-fit the
  // symbol inside the cell instead (aspect-preserving).
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
    image: 'bonus_sym',
    spineName: 'bonus_sym',
    // cor-5x is the top-tier bonus symbol and gets the blue skin, every other cor-Nx uses gold
    skin: multiplier === 5 ? 'blue' : 'gold',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1.1,
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
    image: 'bag_collect',
    spineName: 'bag_collect',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1.1,
  },
  mini: {
    name: 'mini',
    image: 'belt',
    spineName: 'belt',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1.1,
  },
  minor: {
    name: 'minor',
    image: 'boot',
    spineName: 'boot',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1.1,
  },
  major: {
    name: 'major',
    image: 'mask',
    spineName: 'mask',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1.1,
  },
  // Rendered from two spines played together (see JCMysterySymbolModifier) - "spineName" here
  // drives the back layer that ReelSymbolSpine itself creates, the front layer is the extra one.
  mystery: {
    name: 'mystery',
    image: 'mystery_static',
    spineName: 'mystery_back',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.65,
  },
  'mystery jackpot': {
    name: 'mystery jackpot',
    image: 'mystery_static',
    spineName: 'mystery_back',
    idleAnim: 'idle',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.65,
  },
  // No art for this symbol in symbols.json - it renders nothing (see JCReelSymbol.resolveTexture).
  Blanks: {
    name: 'Blanks',
  },
};

const BLANKS_NAME = 'Blanks';
// Weight for getRandomSymbolName() below - out of 100.
export const BLANKS_PERCENT = 70;
const NON_BLANK_SYMBOL_NAMES = Object.keys(SYMBOLS_DATA).filter((name) => name !== BLANKS_NAME);

// BLANKS_PERCENT chance of Blanks, otherwise any other symbol picked uniformly at random. Used
// anywhere a symbol needs a name but there's no real spin result to show yet - HoldNWinReel's
// above-cell placeholder, HoldNWinReelsContainer's dummy spin response, etc.
export function getRandomSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BLANKS_PERCENT;
  return isBlank ? BLANKS_NAME : NON_BLANK_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_SYMBOL_NAMES.length - 1)];
}
