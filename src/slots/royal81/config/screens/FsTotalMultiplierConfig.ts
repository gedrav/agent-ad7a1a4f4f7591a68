import { FsTotalMultiplierComp } from '@brand/views/comps/FsTotalMultiplierComp';

export const FS_TOTAL_MULTI_CONFIG: any = {
  name: 'fsTotalMultiComp',
  type: 'Comp',
  class: FsTotalMultiplierComp,
  x: -380,
  Elements: [
    { name: 'guideRect', type: 'Graphics', color: '0xffff00', width: 360, height: 420, alpha: 0 },
    {
      name: 'totalMulText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      content: 'totalMultiplier',
      style: {
        fontFamily: 'commonFontBold',
        fontSize: 60,
        fill: 0x00f30f,
        wordWrap: true,
        wordWrapWidth: 250,
        align: 'center',
      },
      layoutData: {
        Desktop: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'top' },
      },
    },
    {
      name: 'multiBg',
      type: 'Sprite',
      image: 'stone_ocean',
      layoutData: {
        Desktop: { refComponent: 'guideRect', widthPerc: 0.8, hAlign: 'center', vAlign: 'bottom' },
      },
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
