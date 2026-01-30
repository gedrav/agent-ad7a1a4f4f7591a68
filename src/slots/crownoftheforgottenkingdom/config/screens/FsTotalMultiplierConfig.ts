import { FsTotalMultiplierComp } from '@brand/views/comps/FsTotalMultiplierComp';

export const FS_TOTAL_MULTI_CONFIG: any = {
  name: 'fstotalMultiComp',
  type: 'Comp',
  class: FsTotalMultiplierComp,
  Elements: [
    { name: 'guideRect', type: 'Graphics', color: '0xff0000', width: 400, height: 400, alpha: 0.4 },
    {
      name: 'multiBg',
      type: 'Sprite',
      image: 'stone_ocean',
      layoutData: {
        Desktop: { refComponent: 'guideRect', widthPerc: 1, hAlign: 'center', vAlign: 'middle' },
      },
    },
    {
      name: 'multiplierVal',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      contentText: '100x',
      style: {
        fontFamily: 'gameFont1',
        fontSize: 100,
        fill: 0xfde35c,
      },
      layoutData: {
        Desktop: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
