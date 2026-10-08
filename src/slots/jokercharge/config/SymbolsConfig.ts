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
  // Only the boost has one: what plays each time a collect trail reaches it.
  collectAnim?: string;
  // Only the mystery rigs have one: what plays as the symbol gives way to what it revealed.
  hideAnim?: string;
  multiplierTextConfig?: any;
  // Static label on the rig's root_txt slot; unlike multiplierTextConfig it never changes.
  labelTextConfig?: any;
  // Absolute scale in a Hold & Win cell; omit to auto-fit instead.
  cellScale?: number;
  // Vertical scale, when it differs from cellScale. Defaults to cellScale.
  cellScaleY?: number;
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

// The top tier, so it can't read as a paler version of the gold ones. Electric blue picks up the
// charge the symbol is wrapped in, outranks gold rather than competing with it, and the cyan glow
// carries it clear of the violet behind.
export const GRAND_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 200,
  fill: ['0xFFFFFF', '0xB6F3FF', '0x45CBFF', '0x0E7BE0'],
  fillGradientStops: [0, 0.3, 0.65, 1],
  stroke: {
    fill: ['0x2A0A45', '0x140425'],
    width: 18,
    join: 'round',
  },
  dropShadow: {
    color: 0x21c8ff,
    alpha: 0.9,
    blur: 14,
    distance: 0,
    angle: Math.PI / 2,
  },
};

const MINOR_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 150,
  fill: ['0xBFD9FF', '0x2A63D8', '0x081C5E'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
  // Its own shadow, not the base style's glow: a wide blur behind a gold outline reads as haze.
  dropShadow: {
    color: 0x000000,
    alpha: 0.95,
    blur: 1,
    distance: 5,
    angle: Math.PI / 2,
  },
};

const MAJOR_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 150,
  fill: ['0xD2F09A', '0x3D9E27', '0x0A3A14'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
  dropShadow: {
    color: 0x000000,
    alpha: 0.95,
    blur: 1,
    distance: 5,
    angle: Math.PI / 2,
  },
};

const MINI_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 150,
  // Deeper than the symbol's own magenta, so it reads against it rather than into it.
  fill: ['0xF7A8DC', '0xB01F78', '0x3D0333'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFD700', '0xE8890C'],
    width: 16,
    join: 'round',
  },
  dropShadow: {
    color: 0x000000,
    alpha: 0.95,
    blur: 1,
    distance: 5,
    angle: Math.PI / 2,
  },
};

// The mystery rigs are blue with white lightning, so the label keeps the gold-coin look the cor
// symbols used to carry rather than the charge palette, which would disappear into them.
const MYSTERY_TEXT_STYLE = {
  ...MULTIPLIER_TEXT_STYLE,
  fontSize: 250,
  dropShadow: {
    color: 0x000000,
    alpha: 0.8,
    blur: 2,
    distance: 16,
    angle: Math.PI / 2,
  },
};

const MYSTERY_JACKPOT_TEXT_STYLE = {
  ...MYSTERY_TEXT_STYLE,
  fontSize: 250,
  lineHeight: 270,
  // MYSTERY's gold-on-red flipped to red-on-gold, to mark the bigger prize.
  fill: ['0xFF7A5E', '0xE62B18', '0xB0130B'],
  fillGradientStops: [0, 0.5, 1],
  stroke: {
    fill: ['0xFFE47A', '0xFFC42B', '0xE8890C'],
    width: 26,
    join: 'round',
  },
};

// The jackpots a mystery symbol's mini reel can land on, keyed by the backend's own names. The
// key is what the backend sends, the text is what the player reads: the two differ now that the
// backend uses short codes.
// content is a key into the loaded content, not the words themselves - the three names live in
// commonContent, which every game shares. Resolved where it is drawn rather than here: this module
// is evaluated at import time, before the content files have loaded.
export const JACKPOT_LABELS: Record<string, { content: string; style: any }> = {
  MN: { content: 'miniTitle', style: MINI_TEXT_STYLE },
  MR: { content: 'minorTitle', style: MINOR_TEXT_STYLE },
  MJ: { content: 'majorTitle', style: MAJOR_TEXT_STYLE },
};

// content, not contentText: UIUtil.getText() resolves it against the loaded content, so the words
// are translatable. toUpperCase is applied after that, so the content files can hold them written
// normally and the symbol still reads in caps in every language.
function labelTextConfig(
  content: string,
  style: any = MULTIPLIER_TEXT_STYLE,
  anchor: { x: number; y: number } = { x: 0.5, y: 0.25 },
): any {
  return {
    name: 'labelText',
    type: 'Text',
    anchor,
    content,
    toUpperCase: true,
    style,
  };
}

function bonusSymbolData(multiplier: number): JCSymbolData {
  return {
    name: `C${multiplier}`,
    spineName: 'hat',
    // C5 is the top-tier bonus symbol and gets the blue skin, every other CN uses gold
    skin: multiplier === 5 ? 'blue' : 'gold',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.75,
    multiplierTextConfig: {
      name: 'multiplierVal',
      type: 'Text',
      anchor: { x: 0.5, y: 0.75 },
      style: multiplier === 5 ? GRAND_TEXT_STYLE : MULTIPLIER_TEXT_STYLE,
    },
  };
}

// Two spines: spineName is the back layer, the front is added by JCMysterySymbolModifier.
const MYSTERY_SYMBOL: JCSymbolData = {
  name: 'MY',
  spineName: 'mystery_back',
  idleAnim: 'idle',
  staticAnim: 'static',
  blurAnim: 'static_blur',
  winAnim: 'win',
  landingAnim: 'landing',
  hideAnim: 'hide',
  cellScale: 0.33,
  labelTextConfig: labelTextConfig('mysterySymbolLabel', MYSTERY_TEXT_STYLE, { x: 0.5, y: 0.5 }),
};

const MYSTERY_JACKPOT_SYMBOL: JCSymbolData = {
  name: 'MJP',
  spineName: 'mystery_back',
  idleAnim: 'idle',
  staticAnim: 'static',
  blurAnim: 'static_blur',
  winAnim: 'win',
  landingAnim: 'landing',
  hideAnim: 'hide',
  cellScale: 0.33,
  labelTextConfig: labelTextConfig('mysteryJackpotSymbolLabel', MYSTERY_JACKPOT_TEXT_STYLE, { x: 0.5, y: 0.5 }),
};

// An empty cell, as the backend names it in reelView/holdField.
export const BLANK_SYMBOL_NAME = 'BL';

// Keyed by the backend's symbol names, as sent in reelView/holdField.
export const SYMBOLS_DATA: Record<string, JCSymbolData> = {
  C1: bonusSymbolData(1),
  C2: bonusSymbolData(2),
  C3: bonusSymbolData(3),
  C4: bonusSymbolData(4),
  C5: bonusSymbolData(5),
  BST: {
    name: 'BST',
    spineName: 'bag_collect',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'landing',
    landingAnim: 'landing',
    collectAnim: 'collect',
    cellScale: 0.75,
    // The boost's running total, in C5's colours, on the rig's empty root_txt slot. It starts with
    // nothing showing and fills as the boost collects. TODO: tune the anchor against the bag art.
    multiplierTextConfig: {
      name: 'multiplierVal',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      style: GRAND_TEXT_STYLE,
    },
  },
  MN: {
    name: 'MN',
    spineName: 'belt',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.75,
    labelTextConfig: labelTextConfig('miniTitle', MINI_TEXT_STYLE),
  },
  MR: {
    name: 'MR',
    spineName: 'boot',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.75,
    labelTextConfig: labelTextConfig('minorTitle', MINOR_TEXT_STYLE),
  },
  MJ: {
    name: 'MJ',
    spineName: 'mask',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.75,
    labelTextConfig: labelTextConfig('majorTitle', MAJOR_TEXT_STYLE),
  },
  MY: MYSTERY_SYMBOL,
  MJP: MYSTERY_JACKPOT_SYMBOL,
  SCR: {
    name: 'SCR',
    spineName: 'hat',
    skin: 'gold',
    idleAnim: 'idle',
    staticAnim: 'static',
    blurAnim: 'static_blur',
    winAnim: 'win',
    landingAnim: 'landing',
    cellScale: 0.75,
  },
  SMY: { ...MYSTERY_SYMBOL, name: 'SMY' },
  SMJP: { ...MYSTERY_JACKPOT_SYMBOL, name: 'SMJP' },
  // Rendered by JCBlanksSymbolModifier off reel_sym_add's tile skins, whose art is 1427x972.
  [BLANK_SYMBOL_NAME]: {
    name: BLANK_SYMBOL_NAME,
    cellScale: 0.31,
    cellScaleY: 0.29,
  },
};

export const BOOST_SYMBOL_NAME = 'BST';
// What a boost collects from: the bonus symbols and the jackpots. Never another boost, and never a
// mystery that has not revealed yet - its name is not on this list until it has.
export const BOOST_SOURCE_SYMBOL_NAMES = ['C1', 'C2', 'C3', 'C4', 'C5', 'MN', 'MR', 'MJ'];

// Landing one of these on an active payline in the base game earns a trail up to the logo.
export const TRAIL_SYMBOL_NAMES = ['C1', 'C2', 'C3', 'C4', 'C5', 'MN', 'MR', 'MJ'];

// What a Charged or Super-Charged symbol on the top panel turns a held cash symbol into: one step
// up, and past the top it becomes the mystery jackpot. A cell holding anything not listed here is
// left alone.
export const CHARGE_LADDER: Record<string, string> = {
  C1: 'C2',
  C2: 'C3',
  C3: 'C4',
  C4: 'C5',
  C5: 'MJP',
};

// Base game only: landing one of these locks its cell until the respin feature starts.
export const STICKY_SYMBOL_NAMES = ['SCR', 'SMY', 'SMJP'];

// Every symbol that runs the mystery mini reel and its front spine. The sticky pair behave exactly
// like the two they lock, which is why they are listed here too.
export const MYSTERY_SYMBOL_NAMES = ['MY', 'MJP', 'SMY', 'SMJP'];

// Drawn above their neighbours: their art overflows the cell.
export const OVERSIZED_SYMBOL_NAMES = [...MYSTERY_SYMBOL_NAMES, 'BST'];

// Out of 100.
export const BLANKS_PERCENT = 50;
const NON_BLANK_SYMBOL_NAMES = Object.keys(SYMBOLS_DATA).filter((name) => name !== BLANK_SYMBOL_NAME);

// Placeholder symbol for when there's no real spin result yet.
export function getRandomSymbolName(): string {
  const isBlank = Util.getRandomRange(1, 100) <= BLANKS_PERCENT;
  return isBlank
    ? BLANK_SYMBOL_NAME
    : NON_BLANK_SYMBOL_NAMES[Util.getRandomRange(0, NON_BLANK_SYMBOL_NAMES.length - 1)];
}
