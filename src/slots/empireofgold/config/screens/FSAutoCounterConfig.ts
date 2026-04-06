import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 180,
  y: 1200,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1340, height: 60, alpha: 0 },
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
        fill: 0xffffff,
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
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    },
  ],
};
