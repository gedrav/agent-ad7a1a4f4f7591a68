import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    backgroundAlpha: 0.7,
    animations: {
      BIG_WIN: { start: 'big_start', idle: 'big_idle' },
      SUPER_WIN: { start: 'mega_start', idle: 'mega_idle' },
      MEGA_WIN: { start: 'gigantic_start', idle: 'gigantic_idle' },
      EPIC_WIN: { start: 'unbelievable_start', idle: 'unbelievable_idle' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'bigwins',
      loop: true,
      x: 650,
      y: 500,
    },
    bigWinTextScales: [0.8, 0.85, 0.9, 1],
    bigWinTextStates: {
      BIG_WIN: 'bigWinText',
      SUPER_WIN: 'superWinText',
      MEGA_WIN: 'megaWinText',
      EPIC_WIN: 'epicWinText',
    },
  },
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 1300,
      height: 1080,
      color: 0x000000,
      alpha: 0,
    },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -2500, y: -2500, alpha: 0 },
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 650, y: 140 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 650,
      y: 465,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 400, fill: 0xffffff, letterSpacing: -40 },
        },
      ],
    },
    {
      name: 'winTickerBW',
      type: 'Comp',
      class: WinTicker,
      x: 650,
      y: 900,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 400, fill: 0xffffff, letterSpacing: -40 },
        },
      ],
    },
  ],
  layoutData: {
    Desktop: {
      refComponent: 'guideRect',
      widthPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: -0.02,
    },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 0.9,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: -0.02,
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 0.96,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0.08,
    },
  },
};
