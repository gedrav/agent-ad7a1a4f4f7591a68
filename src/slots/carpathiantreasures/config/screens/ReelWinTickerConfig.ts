import { WinTicker } from '@core/views/comps/WinTicker';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: ReelWinTicker,
  x: 70,
  y: 1030,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1410, height: 80, color: 0xffff00, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 705,
      y: 40,
      Elements: [
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'commonFontBold', fontSize: 36, mFontSize: 50, fill: 0xfce16e, fontWeight: 'bold' },
        },
      ],
    },
  ],
};
