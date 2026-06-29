import { WinTicker } from '@core/views/comps/WinTicker';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: ReelWinTicker,
  x: 42,
  y: 1070,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1630, height: 90, color: 0xffff00, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 815,
      y: 45,
      Elements: [
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'gameFont1', fontSize: 36, mFontSize: 50, fill: 0xc0e3fb },
        },
      ],
    },
  ],
};
