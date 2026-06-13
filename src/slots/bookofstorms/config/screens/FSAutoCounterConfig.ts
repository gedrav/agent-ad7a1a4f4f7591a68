import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

const fontMLProps = { ro: { fontSize: 34 }, cs: { fontSize: 34 } };

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 103,
  y: 1020,
  Elements: [
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 25,
      y: 40,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 28,
        mFontSize: 34,
        fill: 0xffd82c,
        fontWeight: 'bold',
        fontMLProps: fontMLProps,
      },
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: 1365,
      y: 40,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 28,
        mFontSize: 34,
        fill: 0xffd82c,
        fontWeight: 'bold',
        fontMLProps: fontMLProps,
      },
    },
  ],
};
