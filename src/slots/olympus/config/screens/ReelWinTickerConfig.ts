import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
import { MultiComp } from '@game/views/comps/MultiComp';
import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';
import { WinTicker } from '@core/views/comps/WinTicker';

export const REEL_WIN_TICKER_CONFIG: any = {
  name: 'reelWinTicker',
  type: 'Comp',
  class: ReelWinTicker,
  y: 36,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1460, height: 80, color: 0xff0000, alpha: 0 },
    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      Elements: [
        {
          name: 'titleText',
          type: 'Text',
          content: 'totalWin',
          anchor: { x: 1, y: 0 },
          x: 720,
          style: { fontFamily: 'gameFont1', fontSize: 60, fill: 0x501c00 },
        },
        {
          name: 'valueText',
          type: 'Text',
          anchor: { x: 0, y: 0 },
          x: 740,
          style: { fontFamily: 'gameFont1', fontSize: 60, fill: 0x501c00 },
        },
      ],
    },
  ],
};
