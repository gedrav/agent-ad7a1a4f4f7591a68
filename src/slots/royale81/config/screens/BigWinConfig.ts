import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    animations: {
      BIG_WIN: { start: 'Big_win_Start', idle: 'Big_win_idle', end: 'Big_win_End' },
      SUPER_WIN: { start: 'Mega_win_Start', idle: 'Mega_win_idle', end: 'Mega_win_End' },
      MEGA_WIN: { start: 'GIG_win_Start', idle: 'GIG_win_idle', end: 'GIG_win_End' },
      EPIC_WIN: { start: 'UNB_win_Start', idle: 'UNB_win_idle', end: 'UNB_win_End' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'Big_Wins_spine_HD',
      loop: true,
      x: 755,
      y: 560,
    },
    bigWinTextScales: [0.6, 0.65, 0.7, 0.7],
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
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 750, y: 450 },
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
      y: 950,
      Elements: [
        { name: 'banner', type: 'Sprite', image: 'Red_banner', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 40 },
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFontBW', fontSize: 200, fill: 0xffffff },
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
      vPaddingPerc: '-0.09',
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
