import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';

export const TICKER_COMP_CONFIG: any = {
  name: 'tickerComp',
  type: 'Comp',
  class: ReelTickerComp,
  tickerDelay: 3000,
  x: 100,
  y: 1220,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5', 'Ticker6'],
  contentYPadding: 0,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1240, height: 80, alpha: 0, color: 0xff0000 },
    {
      name: 'textCont',
      type: 'Container',
      Elements: [
        {
          name: 'tickerText1',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'commonFontBold',
            fontSize: 40,
            mFontSize: 44,
            fill: 0xffffff,
            fontWeight: 'bold',
          },
        },
        {
          name: 'tickerText2',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          style: {
            fontFamily: 'commonFontBold',
            fontSize: 40,
            mFontSize: 44,
            fill: 0xffffff,
            fontWeight: 'bold',
          },
        },
      ],
    },
    { name: 'maskRect', type: 'Graphics', color: 0xff00ff, width: 1240, height: 80, x: 0, y: 0 },
  ],
};
