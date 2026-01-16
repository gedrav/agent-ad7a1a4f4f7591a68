import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
import { MultiComp } from '@game/views/comps/MultiComp';
import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';

export const TICKER_COMP_CONFIG: any = {
  name: 'tickerComp',
  type: 'Comp',
  class: ReelTickerComp,
  tickerDelay: 8000,
  y: 0,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5'],
  contentYPadding: -2,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1460, height: 120, alpha: 0.25 },
    { name: 'fsbg', type: 'Sprite', image: 'tickerBGFS' },
    { name: 'bg', type: 'Sprite', image: 'tickerBG' },
    {
      name: 'textCont',
      type: 'Container',
      Elements: [
        {
          name: 'tickerText1',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'gameFont1',
            fontSize: 54,
            fill: 0x201300,
          },
        },
        {
          name: 'tickerText2',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'gameFont1',
            fontSize: 54,
            fill: 0x201300,
          },
        },
      ],
    },
    { name: 'maskRect', type: 'Graphics', width: 1390, height: 88, x: 32, y: 28 },
    REEL_WIN_TICKER_CONFIG,
  ],
};
