import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';

export const TICKER_COMP_CONFIG: any = {
  name: 'tickerComp',
  type: 'Comp',
  class: ReelTickerComp,
  tickerDelay: 3000,
  x: 124,
  y: 714,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5'],
  contentYPadding: 0,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1100, height: 44, alpha: 0, color: 0xff0000 },
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
            fill: 0xc0e3fb,
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
            fill: 0xc0e3fb,
            fontWeight: 'bold',
          },
        },
      ],
    },
    { name: 'maskRect', type: 'Graphics', width: 1100, height: 48, color: 0xff0000 },
  ],
};
