import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    backgroundAlpha: 0.7,
    animations: {
      BIG_WIN: { start: 'big_start', idle: 'big_idle' },
      SUPER_WIN: { start: 'meg_start', idle: 'meg_idle' },
      MEGA_WIN: { start: 'gig_start', idle: 'gig_idle' },
      EPIC_WIN: { start: 'unb_start', idle: 'unb_idle' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'big_wins',
      loop: true,
      x: 694,
      y: 409,
      scale: 0.8,
    },
    bigWinTextScales: [0.8, 0.8, 0.8, 0.8],
    bigWinTextStates: {
      BIG_WIN: 'bigWinText',
      SUPER_WIN: 'megaWinText',
      MEGA_WIN: 'gigaWinText',
      EPIC_WIN: 'unbWinText',
    },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1403, height: 752, color: 0x000000, x: 0, y: 0, alpha: 0 },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -2500, y: -2500, alpha: 0 },
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 694, y: 125 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 694,
      y: 360,
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
      x: 694,
      y: 644,
      maxWidth: 800,
      Elements: [
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
      vPaddingPerc: 0.028,
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0.028,
    },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0.028,
    },
  },
};
