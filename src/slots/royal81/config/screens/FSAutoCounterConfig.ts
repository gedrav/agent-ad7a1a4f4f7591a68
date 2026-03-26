import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
import { MultiComp } from '@game/views/comps/MultiComp';
import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';
import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 180,
  y: 930,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1240, height: 60, alpha: 0 },
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 10,
      y: 30,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 28,
        mFontSize: 36,
        fill: 0xffd82c,
        fontWeight: 'bold',
      },
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: 1230,
      y: 30,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 28,
        mFontSize: 36,
        fill: 0xffd82c,
        fontWeight: 'bold',
      },
    },
  ],
};
