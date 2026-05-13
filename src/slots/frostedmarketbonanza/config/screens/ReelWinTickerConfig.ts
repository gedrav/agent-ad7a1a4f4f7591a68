import { CascadeReelWinTicker } from '@brand/views/comps/CascadeReelWinTicker';
import { WinTicker } from '@core/views/comps/WinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: CascadeReelWinTicker,
  x: 79,
  y: 1224,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1240, height: 80, color: 0xffff00, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 620,
      y: 40,
      Elements: [
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'commonFontBold', fontSize: 48, mFontSize: 50, fill: 0xfde35c },
        },
      ],
    },
    {
      name: 'xText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      contentText: 'x',
      style: { fontFamily: 'commonFontBold', fontSize: 48, mFontSize: 50, fill: 0xfde35c },
    },
    {
      name: 'multiplierText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      style: { fontFamily: 'commonFontBold', fontSize: 48, mFontSize: 50, fill: 0xfde35c },
    },
  ],
};
