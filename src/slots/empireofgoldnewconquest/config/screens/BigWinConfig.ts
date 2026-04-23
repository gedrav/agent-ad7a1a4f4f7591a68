import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    backgroundAlpha: 0.2,
    animations: {
      BIG_WIN: { start: 'big_start', idle: 'big_idle' },
      MEGA_WIN: { start: 'mega_start', idle: 'mega_idle' },
      GIGANTIC_WIN: { start: 'gigantic_start', idle: 'gigantic_idle' },
      UNBELIEVABLE_WIN: { start: 'unbelievable_start', idle: 'unbelievable_idle' },
    },
    textAnimations: {
      BIG_WIN: { start: 'big_start', idle: 'big_idle' },
      MEGA_WIN: { start: 'mega_start', idle: 'mega_idle' },
      GIGANTIC_WIN: { start: 'gigantic_start', idle: 'gigantic_idle' },
      UNBELIEVABLE_WIN: { start: 'unbelievable_start', idle: 'unbelievable_idle' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'bigwins',
      loop: true,
      scale: 0.5,
      x: 650,
      y: 500,
    },
    bigWinTextAnim: {
      name: 'bigWinTextAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'text',
      loop: true,
      x: 650,
      y: 600,
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
      widthPerc: 0.96,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0.1,
    },
  },
};
