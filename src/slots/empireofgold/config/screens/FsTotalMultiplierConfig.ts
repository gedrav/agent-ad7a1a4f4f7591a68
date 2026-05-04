import { FsTotalMultiplierComp } from '@brand/views/comps/FsTotalMultiplierComp';

export const FS_TOTAL_MULTI_CONFIG: any = {
  name: 'fsTotalMultiComp',
  type: 'Comp',
  class: FsTotalMultiplierComp,
  x: 86,
  y: -120,
  px: 1328,
  py: -86,
  lx: 86,
  ly: -120,
  Elements: [
    {
      name: 'multiBg',
      type: 'Sprite',
      image: 'mult_collect',
      layoutData: {},
    },
    {
      name: 'multiplierValText',
      type: 'BitmapText',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontFamily: 'bitmapFont',
        fontSize: 100,
        fill: 0xfde35c,
        letterSpacing: -8,
      },
      x: 106,
      y: 50,
    },
  ],
};
