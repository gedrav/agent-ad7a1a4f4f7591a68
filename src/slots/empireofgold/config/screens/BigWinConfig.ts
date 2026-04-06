import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    animations: {
      BIG_WIN: { start: 'big_start', idle: 'big_idle' },
      MEGA_WIN: { start: 'mega_start', idle: 'mega_idle' },
      GIGANTIC_WIN: { start: 'gigantic_start', idle: 'gigantic_idle' },
      UNBELIEVABLE_WIN: { start: 'unbelievable_start', idle: 'unbelievable_idle' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'big_win_2',
      loop: true,
      x: 755,
      y: 430,
    },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1510, height: 932, color: 0xffff00, x: 0, y: 0, alpha: 0 },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -2500, y: -2500, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 755,
      y: 465,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 300, fill: 0xffffff },
        },
      ],
    },
    {
      name: 'winTickerBW',
      type: 'Comp',
      class: WinTicker,
      x: 755,
      y: 900,
      Elements: [
        { name: 'banner', type: 'Sprite', image: 'Red_banner', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 50 },
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 250, fill: 0xffffff },
        },
      ],
    },
  ],
  layoutData: {
    Desktop: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 0.9,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 0.9,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
    },
  },
};
