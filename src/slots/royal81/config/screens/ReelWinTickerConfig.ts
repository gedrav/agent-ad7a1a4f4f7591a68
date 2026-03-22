import { CascadeReelWinTicker } from '@brand/views/comps/CascadeReelWinTicker';
import { WinTicker } from '@core/views/comps/WinTicker';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: ReelWinTicker,
  x: 120,
  y: 930,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1360, height: 60, color: 0xffff00, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 680,
      y: 30,
      Elements: [
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'gameFont1', fontSize: 40, fill: 0xfde35c },
        },
      ],
    },
  ],
};
