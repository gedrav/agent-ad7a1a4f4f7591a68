import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 50,
  y: 1180,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1260, height: 80, alpha: 0, color: 0xff0000 },
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 20,
      y: 36,
      style: {
        fontFamily: 'commonFontBold',
        fontSize: 46,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: 1242,
      y: 36,
      style: {
        fontFamily: 'commonFontBold',
        fontSize: 46,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    },
  ],
};
