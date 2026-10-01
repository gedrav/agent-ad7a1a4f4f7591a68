import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    backgroundAlpha: 0.7,
    animations: {
      BIG_WIN: { start: '1_Big_Intro', idle: '1_Big_Ideal' },
      SUPER_WIN: { start: '2_Mega_Intro', idle: '2_Mega_Ideal' },
      MEGA_WIN: { start: '3_Super_Intro', idle: '3_Super_Ideal' },
      EPIC_WIN: { start: '4_Epic_Intro', idle: '4_Epic_Ideal' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'bigWins',
      loop: true,
      x: 694,
      y: 460,
      scale: 0.3,
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
    { name: 'guideRect', type: 'Graphics', width: 1340, height: 830, color: 0x000000, x: 0, y: 0, alpha: 0 },
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
      y: 740,
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
      hPaddingPerc: -0.01,
      vPaddingPerc: -0.05,
    },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
      hPaddingPerc: -0.1,
      vPaddingPerc: -0.03,
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
      hPaddingPerc: -0.1,
      vPaddingPerc: -0.03,
    },
  },
};
