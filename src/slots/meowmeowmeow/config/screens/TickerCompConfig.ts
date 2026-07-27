import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';

export const TICKER_COMP_CONFIG: any = {
  name: 'tickerComp',
  type: 'Comp',
  class: ReelTickerComp,
  tickerDelay: 3000,
  x: 42,
  y: 1070,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5'],
  contentYPadding: 0,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1630, height: 90, alpha: 0 },
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
            mFontSize: 36,
            fill: 0xd4f4bd,
          },
        },
        {
          name: 'tickerText2',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'gameFont1',
            fontSize: 36,
            mFontSize: 36,
            fill: 0xd4f4bd,
          },
        },
      ],
    },
    { name: 'maskRect', type: 'Graphics', color: 0xff0000, width: 1630, height: 90, x: 0, y: 0 },
  ],
};
