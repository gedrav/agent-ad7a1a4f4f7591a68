import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 206,
  y: 1280,
  Elements: [
    { name: 'bg', type: 'Graphics', width: 1280, height: 80, alpha: 0, color: 0xff0000 },
    { name: 'tickerbg', type: 'Sprite', image: 'last_win', x: 0, y: 0 },
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 40,
      y: 54,
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
      x: 1290,
      y: 54,
      style: {
        fontFamily: 'commonFontBold',
        fontSize: 46,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    },
  ],
};
