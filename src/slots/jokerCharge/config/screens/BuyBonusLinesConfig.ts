import { BuyBonusLinesComp } from '@slots/jokerCharge/views/comps/BuyBonusLinesComp';
import { MULTIPLIER_TEXT_STYLE } from '../SymbolsConfig';

// Positions below are a starting layout derived from the actual sprite pixel sizes (buy_bonus_btn
// 879x1308, choose_lines_panel 1178x350, lines_minus_btn/lines_plus_btn ~392x349). bonusBtnGroup
// and linesGroup are plain Container elements (no class needed) so each can be repositioned/scaled
// as one unit instead of moving every child individually. Portrait values are an approximation
// carried over from the previous per-child layout and will likely need retuning.
export const BUY_BONUS_LINES_CONFIG: any = {
  name: 'buyBonusLinesComp',
  type: 'Comp',
  class: BuyBonusLinesComp,
  x: 1550,
  y: 300,
  layoutData: {
    Desktop: { x: -400, y: 420, scale: 0.3 },
    Portrait: { x: 706, y: 1350, scale: 0.55 },
    Landscape: {},
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1200, height: 1250, color: 0xff0000, alpha: 0 },
    {
      name: 'bonusBtnGroup',
      type: 'Container',
      x: 0,
      y: 0,
      layoutData: {
        Portrait: { x: -520, y: 0, scale: 0.55 },
        Desktop: { x: -100, y: 0, scale: 0.55 },
      },
      Elements: [
        { name: 'buyBonusBtn', type: 'Sprite', image: 'buy_bonus_btn', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 0 },
        { name: 'cartIcon', type: 'Sprite', image: 'сart', anchor: { x: 0.5, y: 0.5 }, x: 0, y: -160 },
        { name: 'bonusText', type: 'Sprite', image: 'BONUS_txt', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 280 },
      ],
    },
    {
      name: 'linesGroup',
      type: 'Container',
      x: 0,
      y: 800,
      layoutData: { Portrait: { x: 150, y: -100, scale: 0.75 } },
      Elements: [
        { name: 'linesText', type: 'Sprite', image: 'LINES_txt', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 0 },
        { name: 'linesPanel', type: 'Sprite', image: 'choose_lines_panel', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 319 },
        {
          name: 'linesMinusBtn',
          type: 'Sprite',
          image: 'lines_minus_btn',
          anchor: { x: 0.5, y: 0.5 },
          x: -393,
          y: 319,
        },
        {
          name: 'linesPlusBtn',
          type: 'Sprite',
          image: 'lines_plus_btn',
          anchor: { x: 0.5, y: 0.5 },
          x: 393,
          y: 319,
        },
        {
          name: 'linesValueText',
          type: 'Text',
          contentText: '1',
          anchor: { x: 0.5, y: 0.5 },
          x: 0,
          y: 319,
          style: MULTIPLIER_TEXT_STYLE,
        },
      ],
    },
  ],
};
