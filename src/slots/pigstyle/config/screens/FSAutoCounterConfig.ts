import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

const fontMLProps = { ro: { fontSize: 34 }, cs: { fontSize: 34 } };

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 56,
  y: 993,
  Elements: [
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 0,
      y: 34,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 32,
        mFontSize: 34,
        fill: 0xc0e3fb,
        fontMLProps: fontMLProps,
        letterSpacing: 2,
      },
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: 1385,
      y: 34,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 32,
        mFontSize: 34,
        fill: 0xc0e3fb,
        fontMLProps: fontMLProps,
        letterSpacing: 2,
      },
    },
  ],
};
