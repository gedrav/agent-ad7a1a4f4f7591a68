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
  x: 120,
  y: 930,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5'],
  contentYPadding: 0,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1360, height: 60, alpha: 0 },
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
            dropShadow: {
              angle: 1.6,
              blur: 0, // use 0 or a positive value in v8
              color: '#470000',
              distance: 2,
              alpha: 1,
            },
            fill: [0xa9fcff, 0x0046ff],
            fillGradientStops: [0.4, 1],
            fontWeight: 'bold',
            letterSpacing: 4,
            stroke: {
              color: '#01021b',
              width: 5,
              join: 'round',
            },
          },
        },
        {
          name: 'tickerText2',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'gameFont1',
            fontSize: 36,
            dropShadow: {
              angle: 1.6,
              blur: 0, // use 0 or a positive value in v8
              color: '#470000',
              distance: 2,
              alpha: 1,
            },
            fill: [0xa9fcff, 0x0046ff],
            fillGradientStops: [0.4, 1],
            fontWeight: 'bold',
            letterSpacing: 4,
            stroke: {
              color: '#01021b',
              width: 5,
              join: 'round',
            },
          },
        },
      ],
    },
    { name: 'maskRect', type: 'Graphics', color: 0xff0000, width: 1360, height: 60, x: 0, y: 0 },
  ],
};
