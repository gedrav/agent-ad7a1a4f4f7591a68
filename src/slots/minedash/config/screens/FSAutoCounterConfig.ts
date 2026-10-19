import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

const fontMLProps = { ro: { fontSize: 34 }, cs: { fontSize: 34 } };

export const FSAUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  x: 124,
  y: 714,
  Elements: [
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: 40,
      y: 22,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 40,
        mFontSize: 42,
        fill: 0xffd200,
        fontWeight: 'bold',
        fontMLProps: fontMLProps,
      },
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: 1060,
      y: 22,
      style: {
        fontFamily: 'gameFont1',
        fontSize: 40,
        mFontSize: 42,
        fill: 0xffd200,
        fontWeight: 'bold',
        fontMLProps: fontMLProps,
      },
    },
  ],
};
