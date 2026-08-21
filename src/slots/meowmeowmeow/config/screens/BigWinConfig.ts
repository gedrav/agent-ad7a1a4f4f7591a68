import { WinTicker } from '@core/views/comps/WinTicker';
import { MMMBigWinsComp } from '@slots/meowmeowmeow/views/comps/MMMBigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: MMMBigWinsComp,
  data: {
    backgroundAlpha: 0.7,
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
      y: 670,
      scale: 0.7,
    },
    bigWinTextScales: [0.7, 0.7, 0.7, 0.7],
    bigWinTextStates: {
      BIG_WIN: 'bigWinText',
      SUPER_WIN: 'superWinText',
      MEGA_WIN: 'megaWinText',
      EPIC_WIN: 'epicWinText',
    },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1660, height: 980, color: 0x000000, x: 0, y: 0, alpha: 0 },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -1000, y: -1000, alpha: 0 },
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 830, y: 142 },
    {
      name: 'featureWinText',
      type: 'AdjustableText',
      maxWidth: 1500,
      content: 'FeatureWinCongratsText',
      visible: false,
      style: {
        fontFamily: 'gameFont2',
        fontSize: 140,
        fontWeight: '900',
        letterSpacing: 8,
        fill: ['0xFFF9C4', '0xFFD700', '0xFFA000', '0xE8890C'],
        fillGradientStops: [0, 0.35, 0.7, 1],
        stroke: {
          fill: ['0x8A0000', '0x6B0000', '0x4A0000'],
          width: 10,
          join: 'round',
        },
        strokeGradientStops: [0, 0.5, 1],
        dropShadow: {
          color: 0x000000,
          alpha: 0.8,
          blur: 2,
          distance: 6,
          angle: Math.PI / 2,
        },
        align: 'center',
      },
      anchor: { x: 0.5, y: 0.5 },
      x: 830,
      y: 77,
    },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 830,
      y: 434,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', align: 'center', fontSize: 400, fill: 0xffffff },
        },
      ],
    },
    {
      name: 'winTickerBW',
      type: 'Comp',
      class: WinTicker,
      x: 830,
      y: 850,
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
    Desktop: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 381, y: 335.5 },
    Portrait: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 0, y: 1065 },
    Landscape: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 381, y: 335.5 },
    SmallLandscape: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, x: 381, y: 335.5 },
  },
};
