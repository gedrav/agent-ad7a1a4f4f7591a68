import { FsTotalMultiplierComp } from '@brand/views/comps/FsTotalMultiplierComp';

export const FS_TOTAL_MULTI_CONFIG: any = {
  name: 'fsTotalMultiComp',
  type: 'Comp',
  class: FsTotalMultiplierComp,
  x: 86,
  y: -110,
  px: 158,
  py: -140,
  lx: 86,
  ly: -110,
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
        fontSize: 90,
        fill: 0xfde35c,
        letterSpacing: -8,
      },
      x: 85,
      y: 58,
    },
  ],
};
