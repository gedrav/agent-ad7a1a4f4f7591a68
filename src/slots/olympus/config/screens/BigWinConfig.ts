import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';

export const BIG_WIN_CONFIG = {
  name: 'bigWinsComp',
  type: 'Comp',
  class: BigWinsComp,
  data: {
    animations: {
      BIG_WIN: { start: 'bigWin_Start', idle: 'bigWin_idle', end: 'bigWin_End' },
      MEGA_WIN: { start: 'megaWin_Start', idle: 'megaWin_Idle', end: 'megaWin_End' },
      GIGANTIC_WIN: { start: 'superBigWin_Start', idle: 'superBigWin_Idle', end: 'superBigWin_End' },
      UNBELIEVABLE_WIN: { start: 'superBigWin_Start', idle: 'superBigWin_Idle', end: 'superBigWin_End' },
    },
  },
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1510, height: 932, color: 0xffff00, x: 0, y: 0, alpha: 0 },
    {
      name: 'bigWinAnim',
      type: 'Spine',
      spineName: 'Lepg_Wins',
      defaultState: 'bigWin_idle',
      loop: true,
      x: 755,
      y: 500,
    },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          x: 770,
          y: 465,
          style: { fontFamily: 'bitmapFont', fontSize: 180, fill: 0xffff00 },
        },
      ],
    },
  ],
  layoutData: {
    Desktop: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
