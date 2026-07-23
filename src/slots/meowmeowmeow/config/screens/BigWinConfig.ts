import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    animations: {
      BIG_WIN: { start: '1_big_Win', idle: '1_big_Win_Loop' },
      SUPER_WIN: { start: '2_Super_Win', idle: '2_Super_Win_Loop' },
      MEGA_WIN: { start: '3_Mega_Win_', idle: '3_Mega_Win_Loop' },
      EPIC_WIN: { start: '4_Epic_Win', idle: '4_Epic_Win_Loop' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'BigWin_Anim',
      loop: true,
      x: 830,
      y: 696,
      scale: 1,
    },
    bigWinTextScales: [0.75, 0.7, 0.7, 0.7],
    bigWinTextStates: {
      BIG_WIN: 'bigWinText',
      SUPER_WIN: 'superWinText',
      MEGA_WIN: 'megaWinText',
      EPIC_WIN: 'epicWinText',
    },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1660, height: 980, color: 0xffff00, x: 0, y: 0, alpha: 0 },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -1000, y: -1000, alpha: 0 },
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 830, y: 55 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 830,
      y: 630,
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
      x: 830,
      y: 960,
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
    Desktop: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 450, y: 294 },
    Portrait: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 0, y: 1010 },
    Landscape: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 450, y: 234 },
    SmallLandscape: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 450, y: 234 },
  },
};
