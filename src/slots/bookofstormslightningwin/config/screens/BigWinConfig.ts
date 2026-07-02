import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    animations: {
      BIG_WIN: { start: 'big_start', idle: 'big' },
      SUPER_WIN: { start: 'mega_start', idle: 'mega' },
      MEGA_WIN: { start: 'gigantic_start', idle: 'gigantic' },
      EPIC_WIN: { start: 'unbelievable_start', idle: 'unbelievable' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'bigWins',
      loop: true,
      x: 755,
      y: 490,
      scale: 1.2,
    },
    bigWinTextScales: [0.8, 0.9, 0.9, 0.9],
    bigWinTextStates: {
      BIG_WIN: 'bigWinText',
      SUPER_WIN: 'superWinText',
      MEGA_WIN: 'megaWinText',
      EPIC_WIN: 'epicWinText',
    },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1510, height: 932, color: 0xffff00, x: 0, y: 0, alpha: 0 },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -2500, y: -2500, alpha: 0 },
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 755, y: 155 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 755,
      y: 370,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 400, fill: 0xffffff },
        },
      ],
    },
    {
      name: 'winTickerBW',
      type: 'Comp',
      class: WinTicker,
      x: 755,
      y: 770,
      Elements: [
        // { name: 'banner', type: 'Sprite', image: 'Red_banner', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 40 },
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFontBW', fontSize: 210, fill: 0xffffff },
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
    },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
    },
  },
};
