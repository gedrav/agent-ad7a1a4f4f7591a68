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
      SUPER_WIN: { start: 'meg_start', idle: 'meg_idle' },
      MEGA_WIN: { start: 'gig_start', idle: 'gig_idle' },
      EPIC_WIN: { start: 'unb_start', idle: 'unb_idle' },
    },
    panelAnimations: {
      BIG_WIN: { start: 'idle', idle: 'idle' },
      SUPER_WIN: { start: 'idle', idle: 'idle' },
      MEGA_WIN: { start: 'idle', idle: 'idle' },
      EPIC_WIN: { start: 'idle', idle: 'idle' },
    },
    bigWinAnim: {
      name: 'bigWinAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'wins',
      loop: true,
      scale: 0.65,
      x: 650,
      y: 450,
    },
    bigWinPanelAnim: {
      name: 'bigWinPanelAnim',
      dontCreateView: true,
      type: 'Spine',
      spineName: 'panel',
      loop: true,
      x: 642,
      y: 480,
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
      width: 1296,
      height: 1050,
      color: 0x000000,
      alpha: 0,
    },
    { name: 'skipRect', type: 'Graphics', width: 5000, height: 5000, color: 0xff0000, x: -2500, y: -2500, alpha: 0 },
    { name: 'bigWinText', type: 'Sprite', image: 'bigWinText', anchor: { x: 0.5, y: 0.5 }, x: 650, y: 140 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 640,
      y: 465,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 380, fill: 0xffffff, letterSpacing: -40 },
        },
      ],
    },
    {
      name: 'winTickerBW',
      type: 'Comp',
      class: WinTicker,
      x: 640,
      y: 842,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 380, fill: 0xffffff, letterSpacing: -40 },
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
      hPaddingPerc: 0,
      vPaddingPerc: -0.036,
    },
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
