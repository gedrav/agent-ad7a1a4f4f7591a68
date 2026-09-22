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
  // Static label on the rig's root_txt slot; unlike multiplierTextConfig it never changes.
  labelTextConfig?: any;
  // Absolute scale in a Hold & Win cell; omit to auto-fit instead.
  cellScale?: number;
  // Set at placement time, not part of a symbol's static definition - picks the blank variant.
  row?: number;
}

// Gold-coin look. A bitmap font can't render any of this - its glyphs are pre-rendered flat.
export const MULTIPLIER_TEXT_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: '900',
  fontSize: 200,
  fill: ['0xFFF9C4', '0xFFD700', '0xFFA000', '0xE8890C'],
  fillGradientStops: [0, 0.35, 0.7, 1],
  stroke: {
    fill: ['0x8A0000', '0x6B0000', '0x4A0000'],
    width: 16,
    join: 'round',
  },
  strokeGradientStops: [0, 0.5, 1],
  dropShadow: {
    color: 0x000000,
    alpha: 0.6,
    blur: 2,
    distance: 6,
    angle: Math.PI / 2,
  },
  align: 'center',
};

const MINOR_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 150,
  fill: ['0x526bbf', '0x677dc6', '0x34498e', '0x2543a5', '0x042454'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

const MAJOR_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 150,
  fill: ['0xE8FFB0', '0x66CC33', '0x1B5E20'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

const MINI_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 150,
  fill: ['0xFFD9F5', '0xD946C4', '0x5A0F6B'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

const GRAND_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 200,
  fill: ['0xFF7B6B', '0xE53911', '0xB71C1C'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

function labelTextConfig(text: string, style: any = MULTIPLIER_TEXT_STYLE): any {
  return {
    name: 'labelText',
    type: 'Text',
    anchor: { x: 0.5, y: 0.25 },
    contentText: text,
    style,
  };
}

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
    cellScale: 1,
    multiplierTextConfig: {
      name: 'multiplierVal',
      type: 'Text',
      anchor: { x: 0.5, y: 0.75 },
      style: multiplier === 5 ? GRAND_TEXT_STYLE : MULTIPLIER_TEXT_STYLE,
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
    cellScale: 1,
  },
  mini: {
    name: 'mini',
    spineName: 'belt',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1,
    labelTextConfig: labelTextConfig('MINI', MINI_TEXT_STYLE),
  },
  minor: {
    name: 'minor',
    spineName: 'boot',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1,
    labelTextConfig: labelTextConfig('MINOR', MINOR_TEXT_STYLE),
  },
  major: {
    name: 'major',
    spineName: 'mask',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 1,
    labelTextConfig: labelTextConfig('MAJOR', MAJOR_TEXT_STYLE),
  },
  // Two spines: spineName is the back layer, the front is added by JCMysterySymbolModifier.
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
  // No spine - renders as a sprite instead (see JCBlanksSymbolModifier).
  Blanks: {
    name: 'Blanks',
    cellScale: 0.2,
  },
};

const BLANKS_NAME = 'Blanks';
// Out of 100.
export const BLANKS_PERCENT = 50;
const NON_BLANK_SYMBOL_NAMES = Object.keys(SYMBOLS_DATA).filter((name) => name !== BLANKS_NAME);

// Placeholder symbol for when there's no real spin result yet.
export function getRandomSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BLANKS_PERCENT;
  return isBlank ? BLANKS_NAME : NON_BLANK_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_SYMBOL_NAMES.length - 1)];
}
