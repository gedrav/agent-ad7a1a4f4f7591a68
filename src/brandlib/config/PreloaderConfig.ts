export const PRELOADER_CONFIG: any = {
  name: 'PRELOADER_CONFIG',
  BGColor: 0x000000,
  nonInteractive: true,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 480,
      height: 300,
      color: 0xff0000,
      alpha: 0,
    },
    {
      name: 'brandLogo',
      type: 'Sprite',
      image: 'brandLogo',
      x: 240,
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
      y: 250,
      Elements: [
        {
          name: 'bg',
          type: 'RoundedRectangle',
          width: 480,
          height: 12,
          radius: 6,
          color: '0xECF0F8',
        },
        { name: 'circle1', type: 'Circle', radius: 6, color: '0x454C5D', x: 6, y: 6 },
        { name: 'circle2', type: 'Circle', radius: 6, color: '0x454C5D', x: 474, y: 6 },
        {
          name: 'bar',
          type: 'Rectangle',
          width: 474,
          height: 12,
          x: 3,
          color: '0x454C5D',
        },
      ],
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.5, heightPerc: 0.5 },
    Portrait: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.5, heightPerc: 0.5 },
    Landscape: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.5, heightPerc: 0.5 },
  },
};
