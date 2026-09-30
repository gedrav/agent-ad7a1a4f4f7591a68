import { BuyBonusLinesComp } from '@slots/jokerCharge/views/comps/BuyBonusLinesComp';
import { MULTIPLIER_TEXT_STYLE } from '../SymbolsConfig';

// Sprite sizes at runtime (the sheet is packed at meta.scale 0.25, so Pixi reports 4x the frame):
// buy_bonus_btn 880x1308, cart 380x336, BONUS_txt 744x188, choose_lines_panel 1180x352,
// lines_minus_btn/lines_plus_btn 392x348.
//
// Desktop and landscape stack the two groups in the margin left of the machine. Portrait has no
// such margin, so the row sits under the reels as a bar: a wide bonus button on the left with the
// cart and label side by side, the lines selector on the right. Portrait keeps every parent at
// scale 1 so its numbers are machine units, where 1400 is the full width of the machine.
//
// Every element lists all three orientations. The fallback order is Landscape > Portrait > Desktop,
// so an element with only a Portrait entry would hand its portrait values to the other two as well.
export const BUY_BONUS_LINES_CONFIG: any = {
  name: 'buyBonusLinesComp',
  type: 'Comp',
  class: BuyBonusLinesComp,
  x: 1550,
  y: 300,
  layoutData: {
    Desktop: { x: -400, y: 420, scale: 0.3 },
    // Machine-space y 980 is just under the reels, which end near 950.
    Portrait: { x: 0, y: 980, scale: 1 },
    Landscape: { x: -400, y: 420, scale: 0.3 },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1200, height: 1250, color: 0xff0000, alpha: 0 },
    {
      // Responsive rather than a plain Container: the comp adjusts its own children, but not its
      // grandchildren, so the group has to resize the button's parts itself.
      name: 'bonusBtnGroup',
      type: 'ResponsiveChildrenContainer',
      x: 0,
      y: 0,
      layoutData: {
        Desktop: { x: 0, y: 0, scale: 1 },
        Portrait: { x: 270, y: 160, scale: 0.8 },
        Landscape: { x: 0, y: 0, scale: 1 },
      },
      Elements: [
        {
          name: 'buyBonusBtn',
          type: 'Sprite',
          image: 'buy_bonus_btn',
          anchor: { x: 0.5, y: 0.5 },
          x: 0,
          y: 0,
          layoutData: {
            Desktop: { x: 0, y: 0, scale: 1 },
            // The plate is a plain rounded rectangle, so width/height reshape it into the bar
            // from the mock. Its own aspect is 880x1308, hence the heavy vertical squash.
            Portrait: { x: 0, y: 0, width: 560, height: 170 },
            Landscape: { x: 0, y: 0, scale: 1 },
          },
        },
        {
          name: 'cartIcon',
          type: 'Sprite',
          image: 'сart',
          anchor: { x: 0.5, y: 0.5 },
          x: 0,
          y: -160,
          layoutData: {
            Desktop: { x: 0, y: -160, scale: 1 },
            Portrait: { x: -170, y: 0, scale: 0.33 },
            Landscape: { x: 0, y: -160, scale: 1 },
          },
        },
        {
          name: 'bonusText',
          type: 'Sprite',
          image: 'BONUS_txt',
          anchor: { x: 0.5, y: 0.5 },
          x: 0,
          y: 280,
          layoutData: {
            Desktop: { x: 0, y: 280, scale: 1 },
            Portrait: { x: 70, y: 0, scale: 0.45 },
            Landscape: { x: 0, y: 280, scale: 1 },
          },
        },
      ],
    },
    {
      name: 'linesGroup',
      type: 'Container',
      layoutData: {
        Desktop: { x: 0, y: 800, scale: 1 },
        Portrait: { x: 1120, y: 60, scale: 0.3 },
        Landscape: { x: 0, y: 800, scale: 1 },
      },
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
