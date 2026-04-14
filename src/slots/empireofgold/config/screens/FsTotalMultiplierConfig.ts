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
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontFamily: 'commonFontBold',
        fontSize: 90,
        fill: 0xfde35c,
      },
      layoutData: {
        Desktop: { refComponent: 'multiBg', hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
