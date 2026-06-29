import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

const fontMLProps = { ro: { fontSize: 34 }, cs: { fontSize: 34 } };

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 42,
  y: 1070,
  Elements: [
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 20,
      y: 48,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 42,
        mFontSize: 42,
        fill: 0xc0e3fb,
        fontWeight: 'bold',
        fontMLProps: fontMLProps,
      },
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: 1610,
      y: 48,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 42,
        mFontSize: 42,
        fill: 0xc0e3fb,
        fontWeight: 'bold',
        fontMLProps: fontMLProps,
      },
    },
  ],
};
