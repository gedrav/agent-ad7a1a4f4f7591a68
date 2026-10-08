import { RespinIntroComp } from '@slots/jokercharge/views/comps/RespinIntroComp';

const GUIDE_WIDTH = 980;
const GUIDE_HEIGHT = 1120;
const CENTER_X = GUIDE_WIDTH / 2;

const DIM_SIZE = 10000;
// Nothing is drawn behind the content, so the dim is the whole backdrop and stays heavy enough for
// gold text to read against it.
const DIM_ALPHA = 0.92;

// The four feature tiles are 1440x612 each, so this leaves a margin either side of the pair and a
// gap down the middle.
const BADGE_SCALE = 0.28;
const COLUMN_OFFSET = 222;
const LEFT_COLUMN_X = CENTER_X - COLUMN_OFFSET;
const RIGHT_COLUMN_X = CENTER_X + COLUMN_OFFSET;

// The game's own gold, the same ramp the cash symbols carry, so the intro reads as part of the
// game rather than as a popup borrowed from somewhere else.
const GOLD_FILL = [0xfffdf0, 0xffe98a, 0xffc23c, 0xe8890c];
const GOLD_STOPS = [0, 0.35, 0.7, 1];
const GOLD_STROKE = { fill: [0x6b1b00, 0x2a0a00], width: 10, join: 'round' };
const GOLD_STROKE_STOPS = [0, 1];
const TEXT_SHADOW = { color: 0x000000, alpha: 0.65, blur: 4, distance: 6, angle: Math.PI / 2 };

const HEADING_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fontSize: 46,
  fill: GOLD_FILL,
  fillGradientStops: GOLD_STOPS,
  stroke: GOLD_STROKE,
  strokeGradientStops: GOLD_STROKE_STOPS,
  dropShadow: TEXT_SHADOW,
  align: 'center',
  wordWrap: true,
  wordWrapWidth: 820,
};

const CAPTION_STYLE = {
  ...HEADING_STYLE,
  fontSize: 40,
  stroke: { ...GOLD_STROKE, width: 8 },
  wordWrapWidth: 400,
};

// White into gold rather than the gold ramp: this one sits lowest, furthest from the title, and
// wants to read as quieter than everything above it without going dim.
const TAP_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fontSize: 46,
  fill: [0xffffff, 0xffe9a8],
  fillGradientStops: [0, 1],
  stroke: { color: 0x2a0a00, width: 8, join: 'round' },
  dropShadow: TEXT_SHADOW,
  align: 'center',
};

function badge(name: string, image: string, x: number, y: number): any {
  return { name, type: 'Sprite', image, anchor: { x: 0.5, y: 0.5 }, scale: BADGE_SCALE, x, y };
}

// content, not contentText: UIUtil.getText() resolves it against the loaded gameContent, so the
// words are translatable. toUpperCase is applied after that, so every language gets the same
// all-caps treatment without each one having to be written that way.
function centeredText(name: string, content: string, y: number, style: any, x: number = CENTER_X): any {
  return { name, type: 'Text', content, toUpperCase: true, anchor: { x: 0.5, y: 0.5 }, x, y, style };
}

export const RESPIN_INTRO_CONFIG: any = {
  name: 'respinIntroComp',
  type: 'Comp',
  class: RespinIntroComp,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: GUIDE_WIDTH,
      height: GUIDE_HEIGHT,
      x: 0,
      y: 0,
      color: 0xff0000,
      alpha: 0,
    },
    // Outside introGroup: the group scales as it opens, and the dim has to stay still and full
    // bleed while that happens.
    {
      name: 'dim',
      type: 'Graphics',
      width: DIM_SIZE,
      height: DIM_SIZE,
      color: 0x000000,
      alpha: DIM_ALPHA,
      x: CENTER_X - DIM_SIZE / 2,
      y: GUIDE_HEIGHT / 2 - DIM_SIZE / 2,
    },
    {
      name: 'introGroup',
      type: 'Container',
      x: 0,
      y: 0,
      Elements: [
        // The drawn title from the buy-bonus sheet rather than a Text: it is the same lettering the
        // buy-bonus screen opens with, bevelled and lit in a way a font and a stroke cannot be.
        {
          name: 'title',
          type: 'Sprite',
          image: 'BONUS GAME_txt',
          anchor: { x: 0.5, y: 0.5 },
          scale: 0.66,
          x: CENTER_X,
          y: 130,
        },
        centeredText('heading', 'respinIntroHeading', 265, HEADING_STYLE),
        badge('chargeSym', 'charge', LEFT_COLUMN_X, 430),
        badge('multiSym', 'multi', RIGHT_COLUMN_X, 430),
        badge('superChargeSym', 'superCharge', LEFT_COLUMN_X, 615),
        badge('superMultiSym', 'superMulti', RIGHT_COLUMN_X, 615),
        centeredText('chargeCaption', 'respinIntroChargeCaption', 800, CAPTION_STYLE, LEFT_COLUMN_X),
        centeredText('multiCaption', 'respinIntroMultiCaption', 800, CAPTION_STYLE, RIGHT_COLUMN_X),
        centeredText('tapToContinue', 'respinIntroTapToContinue', 1000, TAP_STYLE),
      ],
    },
  ],
  // heightPerc as well as widthPerc: with both set the engine scales by min(wsc, hsc), and the
  // guide is taller than it is wide, so on a short landscape screen width alone would run it off
  // the top and bottom.
  layoutData: {
    Desktop: { widthPerc: 0.42, heightPerc: 0.86, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.92, heightPerc: 0.8, hAlign: 'center', vAlign: 'middle' },
    // No SmallLandscape of its own: the guide holds all of this screen's content, so the height
    // budget is the same on every landscape phone.
    Landscape: { widthPerc: 0.46, heightPerc: 0.88, hAlign: 'center', vAlign: 'middle' },
  },
};
