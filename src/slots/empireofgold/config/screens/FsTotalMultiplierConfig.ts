import { FsTotalMultiplierComp } from '@brand/views/comps/FsTotalMultiplierComp';

export const FS_TOTAL_MULTI_CONFIG: any = {
  name: 'fsTotalMultiComp',
  type: 'Comp',
  class: FsTotalMultiplierComp,
  x: 300,
  y: 8,
  px: 14,
  py: 348,
  lx: 300,
  ly: 8,
  Elements: [
    {
      name: 'multiBg',
      type: 'Sprite',
      image: 'mult_collect',
      layoutData: {},
    },
    {
      name: 'multiplierValText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontFamily: 'gameFont1',
        fontSize: 90,
        fill: 0xfde35c,
      },
      layoutData: {
        Desktop: { refComponent: 'multiBg', hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
