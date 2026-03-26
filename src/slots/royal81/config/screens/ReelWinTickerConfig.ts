import { CascadeReelWinTicker } from '@brand/views/comps/CascadeReelWinTicker';
import { WinTicker } from '@core/views/comps/WinTicker';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: ReelWinTicker,
  x: 180,
  y: 930,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1240, height: 60, color: 0xffff00, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 620,
      y: 26,
      Elements: [
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'gameFont1', fontSize: 48, mFontSize: 60, fill: 0xfde35c },
        },
      ],
    },
  ],
};
