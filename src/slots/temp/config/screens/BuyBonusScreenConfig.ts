import { BuyBonusScreenComp } from '@slots/temp/views/comps/BuyBonusScreenComp';

const GUIDE_WIDTH = 1800;
const GUIDE_HEIGHT = 1600;
const CENTER_X = GUIDE_WIDTH / 2;

export const BUY_BONUS_CONTENT_PIVOT = { x: CENTER_X, y: GUIDE_HEIGHT / 2 };

const DIM_SIZE = 10000;
export const BUY_BONUS_DIM_ALPHA = 0.95;

export const BUY_BONUS_OPEN_DURATION = 0.35;
export const BUY_BONUS_CLOSE_DURATION = 0.2;
export const BUY_BONUS_OPEN_EASE = 'back.out(1.6)';
export const BUY_BONUS_CLOSE_EASE = 'power2.in';
export const BUY_BONUS_START_SCALE = 0.85;
const CARD_SCALE = 0.4;
const CARD_WIDTH = 1429 * CARD_SCALE;
const CARD_HEIGHT = 2656 * CARD_SCALE;
const CARD_GAP = 70;
const CARD_XS = [CENTER_X - (CARD_WIDTH + CARD_GAP), CENTER_X, CENTER_X + (CARD_WIDTH + CARD_GAP)];
const CARD_Y = 900;

const HEADER_SCALE = (CARD_WIDTH * 0.8) / 1180;
const FOOTER_SCALE = (CARD_WIDTH * 0.8) / 860;
const BUY_BUTTON_SCALE = (CARD_WIDTH * 0.88) / 1116;
const BUY_LABEL_SCALE = (CARD_WIDTH * 0.26) / 373;
const CHARGED_TITLE_SCALE = (CARD_WIDTH * 0.72) / 852;
const SUPERCHARGED_TITLE_SCALE = CARD_WIDTH / 1402;
const ART_SCALES = [(CARD_WIDTH * 0.9) / 1875, (CARD_WIDTH * 0.75) / 1217, (CARD_WIDTH * 0.85) / 1458];

const HEADER_Y = -CARD_HEIGHT * 0.4;
const ART_Y = -CARD_HEIGHT * 0.1;
const FOOTER_Y = CARD_HEIGHT * 0.22;
const BUY_BUTTON_Y = CARD_HEIGHT * 0.335;
const BUY_LABEL_Y = CARD_HEIGHT * 0.295;
const PRICE_Y = CARD_HEIGHT * 0.37;
const TITLE_Y = -CARD_HEIGHT * 0.525;

const BET_ROW_WIDTH = CARD_WIDTH * 3 + CARD_GAP * 2;
const BET_PANEL_SCALE = BET_ROW_WIDTH / 3806;
const BET_LABEL_SCALE = (BET_ROW_WIDTH * 0.15) / 336;
const BET_BUTTON_SCALE = (BET_ROW_WIDTH * 0.18) / 644;
const BET_BUTTON_X = BET_ROW_WIDTH * 0.34;
const BET_ROW_Y = CARD_Y + CARD_HEIGHT * 0.5 + 235;

const CLOSE_SCALE = 200 / 393;

export const BUY_BONUS_FEATURE_IDS = ['FG1', 'FG2', 'FG3'];

const PRICE_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fill: [0xffffff, 0xd9f5c8],
  stroke: { color: 0x14400c, width: 10 },
  fontSize: 88,
  align: 'center',
};

const BET_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fill: [0xffffff, 0xe6d4ff],
  stroke: { color: 0x2a0a45, width: 10 },
  fontSize: 110,
  align: 'center',
};

const CLOSE_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fill: [0xffffff, 0xbfe2ff],
  stroke: { color: 0x17347d, width: 10 },
  fontSize: 78,
  align: 'center',
};

function sprite(name: string, image: string, x: number, y: number, scale: number): any {
  return { name, type: 'Sprite', image, anchor: { x: 0.5, y: 0.5 }, scale, x, y };
}

function text(name: string, contentText: string, x: number, y: number, style: any): any {
  return { name, type: 'Text', contentText, anchor: { x: 0.5, y: 0.5 }, x, y, style };
}

function card(index: number, artImage: string, footerImage: string): any {
  return {
    name: `card${index}`,
    type: 'Container',
    x: CARD_XS[index],
    y: CARD_Y,
    Elements: [
      sprite('panel', `bonus_${index + 1}_panel`, 0, 0, CARD_SCALE),
      sprite('header', 'BONUS GAME_txt', 0, HEADER_Y, HEADER_SCALE),
      sprite('art', artImage, 0, ART_Y, ART_SCALES[index]),
      sprite('footer', footerImage, 0, FOOTER_Y, FOOTER_SCALE),
      {
        name: 'buyGroup',
        type: 'Container',
        x: 0,
        y: BUY_BUTTON_Y + 20,
        Elements: [
          sprite('buyBtn', 'BUY_button', 0, 0, BUY_BUTTON_SCALE),
          sprite('buyLabel', 'BUY_txt', 0, BUY_LABEL_Y - BUY_BUTTON_Y, BUY_LABEL_SCALE),
          text('priceText', '', 0, PRICE_Y - BUY_BUTTON_Y, PRICE_STYLE),
        ],
      },
    ],
  };
}

export const BUY_BONUS_SCREEN_CONFIG: any = {
  name: 'buyBonusScreenComp',
  type: 'Comp',
  class: BuyBonusScreenComp,
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
      name: 'dim',
      type: 'Graphics',
      width: DIM_SIZE,
      height: DIM_SIZE,
      color: 0x000000,
      alpha: BUY_BONUS_DIM_ALPHA,
      x: CENTER_X - DIM_SIZE / 2,
      y: GUIDE_HEIGHT / 2 - DIM_SIZE / 2,
    },
    {
      name: 'content',
      type: 'Container',
      x: 0,
      y: 0,
      Elements: [
        card(0, 'bonus_1_art', 'RANDOM_txt'),
        card(1, 'bonus_2_art', 'GUARANTEED_txt'),
        card(2, 'bonus_3_art', 'GUARANTEED_txt'),
        sprite('chargedTitle', 'CHARGED_txt', CARD_XS[1], CARD_Y + TITLE_Y + 40, CHARGED_TITLE_SCALE),
        sprite('superChargedTitle', 'SUPERCHARGED_txt', CARD_XS[2], CARD_Y + TITLE_Y + 40, SUPERCHARGED_TITLE_SCALE),
        {
          name: 'betBar',
          type: 'Container',
          x: CENTER_X,
          y: BET_ROW_Y,
          Elements: [
            sprite('panel', 'bet_panel', 0, 0, BET_PANEL_SCALE),
            sprite('betLabel', 'BET', 0, -52, BET_LABEL_SCALE),
            text('betValue', '', 0, 46, BET_STYLE),
            sprite('minusBtn', 'minus_btn', -BET_BUTTON_X, 0, BET_BUTTON_SCALE),
            sprite('plusBtn', 'plus_btn', BET_BUTTON_X, 0, BET_BUTTON_SCALE),
          ],
        },
        {
          name: 'closeBtn',
          type: 'Container',
          x: GUIDE_WIDTH,
          y: 210,
          Elements: [sprite('icon', 'lines_btn', 0, 0, CLOSE_SCALE), text('label', 'X', 0, 0, CLOSE_STYLE)],
        },
      ],
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.42, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.95, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.5, hAlign: 'center', vAlign: 'middle' },
  },
};
