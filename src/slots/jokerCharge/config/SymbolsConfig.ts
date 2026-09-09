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
  // Static label attached to the rig's root_txt slot (see JCReelSymbol.createExtraElements()) -
  // unlike multiplierTextConfig, the text never changes after creation.
  labelTextConfig?: any;
  // Fixed, absolute scale for this symbol in a Hold & Win cell (see HoldNWinReel.applySymbolScale).
  // Omit to auto-fit the symbol inside the cell instead.
  cellScale?: number;
  // Which Hold & Win grid row (0-2) this instance currently occupies - set at placement time by
  // HoldNWinReel/JCReelSymbolPool, not part of a symbol's static definition. Used by
  // JCBlanksSymbolModifier to pick the bright/dim blank variant (see JCLinesState.isRowActive()).
  row?: number;
}

// Gold-coin look (gradient fill + gradient stroke + drop shadow) - a bitmap font can't render any
// of this, since its glyphs are pre-rendered flat images. Recipe matches meowmeowmeow's
// BigWinConfig.ts featureWinText style, scaled down for a small symbol overlay instead of a banner.
export const MULTIPLIER_TEXT_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: '900',
  fontSize: 200,
  fill: ['0xFFF9C4', '0xFFD700', '0xFFA000', '0xE8890C'],
  fillGradientStops: [0, 0.35, 0.7, 1],
  stroke: {
    fill: ['0x8A0000', '0x6B0000', '0x4A0000'],
    width: 6,
    join: 'round',
  },
  strokeGradientStops: [0, 0.5, 1],
  dropShadow: {
    color: 0x000000,
    alpha: 0.6,
    blur: 2,
    distance: 16,
    angle: Math.PI / 2,
  },
  align: 'center',
};

// Same gold stroke/shadow recipe as MULTIPLIER_TEXT_STYLE, but with a blue fill to match the
// "MINOR" reference image.
const MINOR_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fill: ['0xFFFFFF', '0x4FC3F7', '0x0D47A1'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFF9C4', '0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

// Same recipe again, green fill to match the "MAJOR" reference image.
const MAJOR_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fill: ['0xE8FFB0', '0x66CC33', '0x1B5E20'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFF9C4', '0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

// Same recipe again, magenta/purple fill to match the "MINI" reference image.
const MINI_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fill: ['0xFFD9F5', '0xD946C4', '0x5A0F6B'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFF9C4', '0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
};

function labelTextConfig(text: string, style: any = MULTIPLIER_TEXT_STYLE): any {
  return {
    name: 'labelText',
    type: 'Text',
    anchor: { x: 0.5, y: 0.5 },
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
    cellScale: 0.6,
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
    cellScale: 0.6,
    labelTextConfig: labelTextConfig('MAJOR', MAJOR_TEXT_STYLE),
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
  // No spine - renders as a sprite instead (see JCBlanksSymbolModifier).
  Blanks: {
    name: 'Blanks',
    cellScale: 0.2,
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
