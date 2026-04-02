export const SPLASH_PRELOADER_CONFIG: any = {
  name: 'SPLASH_PRELOADER_CONFIG',
  BGColor: 0x000000,
  nonInteractive: true,
  Elements: [
    {
      name: 'progressBar',
      type: 'Container',
      x: 0,
      y: 80,
      Elements: [
        {
          name: 'bg',
          type: 'RoundedRectangle',
          width: 400,
          height: 6,
          radius: 3,
          color: '0xECF0F8',
        },
        { name: 'circle1', type: 'Circle', radius: 3, color: '0x454C5D', x: 3, y: 3 },
        { name: 'circle2', type: 'Circle', radius: 3, color: '0x454C5D', x: 236, y: 3 },
        {
          name: 'bar',
          type: 'Rectangle',
          width: 394,
          height: 6,
          x: 3,
          color: '0x5841f1',
        },
      ],
    },
  ],
  layoutData: {
    Desktop: {
      refComponent: 'guideRect',
      hAlign: 'center',
      vAlign: 'top',
      maxScale: 1,
      widthPerc: 1,
    },
    Portrait: {
      refComponent: 'guideRect',
      hAlign: 'center',
      vAlign: 'middle',
      maxScale: 1,
      widthPerc: 1,
    },
    Landscape: {
      refComponent: 'guideRect',
      hAlign: 'center',
      vAlign: 'middle',
      maxScale: 1,
      widthPerc: 1,
    },
  },
};
