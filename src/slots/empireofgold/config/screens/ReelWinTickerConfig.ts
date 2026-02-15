import { CascadeReelWinTicker } from '@brand/views/comps/CascadeReelWinTicker';
import { WinTicker } from '@core/views/comps/WinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: CascadeReelWinTicker,
  y: 36,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1460, height: 80, color: 0xff0000, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      Elements: [
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'gameFont1', fontSize: 80, fill: 0xfde35c },
        },
      ],
    },
    {
      name: 'xText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      contentText: 'x',
      style: { fontFamily: 'gameFont1', fontSize: 80, fill: 0xfde35c },
    },
    {
      name: 'multiplierText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      style: { fontFamily: 'gameFont1', fontSize: 80, fill: 0xfde35c },
    },
  ],
};
