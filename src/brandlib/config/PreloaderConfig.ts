export const PRELOADER_CONFIG: any = {
  name: 'PRELOADER_CONFIG',
  BGColor: 0x000000,
  nonInteractive: true,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 400,
      height: 270,
      color: 0xff0000,
      alpha: 0,
    },
    {
      name: 'brandLogo',
      type: 'Sprite',
      image: 'brandLogo',
      x: 200,
      y: 120,
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { scale: 1 },
        Portrait: { scale: 0.5 },
        Landscape: { scale: 0.5 },
      },
    },
    {
      name: 'progressBar',
      type: 'Container',
      x: 0,
      y: 260,
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
    Desktop: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.12, heightPerc: 0.1 },
    Portrait: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.32, heightPerc: 0.25 },
    Landscape: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.2, heightPerc: 0.2 },
  },
};
