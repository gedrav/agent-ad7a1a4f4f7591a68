import { RespinIntroComp } from '@slots/jokerCharge/views/comps/RespinIntroComp';

const GUIDE_WIDTH = 900;
const GUIDE_HEIGHT = 980;
const CENTER_X = GUIDE_WIDTH / 2;

const DIM_SIZE = 10000;
const DIM_ALPHA = 0.92;

const SYMBOL_SCALE = 0.229;
const COLUMN_OFFSET = 200;
const LEFT_COLUMN_X = CENTER_X - COLUMN_OFFSET;
const RIGHT_COLUMN_X = CENTER_X + COLUMN_OFFSET;

const TITLE_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fill: [0xffed54, 0xf5a100],
  stroke: { color: 0x000000, width: 6 },
  fontSize: 96,
};

const HEADING_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 700,
  fill: [0xffed54, 0xf5a100],
  fontSize: 40,
  align: 'center',
  wordWrap: true,
  wordWrapWidth: 700,
};

const CAPTION_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 700,
  fill: [0xffed54, 0xf5a100],
  stroke: { color: 0x000000, width: 6 },
  fontSize: 38,
  align: 'center',
  wordWrap: true,
  wordWrapWidth: 340,
};

const TAP_STYLE = {
  fontFamily: 'gameFont1',
  fontWeight: 400,
  fill: [0x837878, 0x6b6b6b],
  fontSize: 42,
  align: 'center',
};

function symbol(name: string, image: string, x: number, y: number): any {
  return { name, type: 'Sprite', image, anchor: { x: 0.5, y: 0.5 }, scale: SYMBOL_SCALE, x, y };
}

function centeredText(name: string, contentText: string, y: number, style: any, x: number = CENTER_X): any {
  return { name, type: 'Text', contentText, anchor: { x: 0.5, y: 0.5 }, x, y, style };
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
    {
      name: 'introGroup',
      type: 'Container',
      x: 0,
      y: 0,
      Elements: [
        // First in the group, so it sits behind everything else the intro draws.
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
        centeredText('title', 'BONUS GAME', 70, TITLE_STYLE),
        centeredText('heading', 'Extra Features can increase or multiply the winnings', 205, HEADING_STYLE),
        symbol('chargeSym', 'charge', LEFT_COLUMN_X, 365),
        symbol('multiSym', 'multi', RIGHT_COLUMN_X, 365),
        symbol('superChargeSym', 'superCharge', LEFT_COLUMN_X, 525),
        symbol('superMultiSym', 'superMulti', RIGHT_COLUMN_X, 525),
        centeredText('chargeCaption', 'Upgrade the Bonus symbols', 650, CAPTION_STYLE, LEFT_COLUMN_X),
        centeredText('multiCaption', "Increase the symbols' multipliers", 672, CAPTION_STYLE, RIGHT_COLUMN_X),
        centeredText('tapToContinue', 'TAP TO CONTINUE', 860, TAP_STYLE),
      ],
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.32, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.85, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.4, hAlign: 'center', vAlign: 'middle' },
  },
};
