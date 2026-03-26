import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
import { MultiComp } from '@game/views/comps/MultiComp';
import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';

export const TICKER_COMP_CONFIG: any = {
  name: 'tickerComp',
  type: 'Comp',
  class: ReelTickerComp,
  tickerDelay: 3000,
  x: 180,
  y: 930,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5'],
  contentYPadding: 0,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1240, height: 60, alpha: 0 },
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
            fontSize: 36,
            mFontSize: 44,
            fill: 0xa9fcff,
            fontWeight: 'bold',
          },
        },
        {
          name: 'tickerText2',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'gameFont1',
            fontSize: 36,
            mFontSize: 44,
            fill: 0xa9fcff,
            fontWeight: 'bold',
          },
        },
      ],
    },
    { name: 'maskRect', type: 'Graphics', color: 0xff0000, width: 1240, height: 60, x: 0, y: 0 },
  ],
};
