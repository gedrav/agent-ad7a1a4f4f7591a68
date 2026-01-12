export const PRELOADER_CONFIG: any = {
  name: 'PRELOADER_CONFIG',
  BGColor: 0x000000,
  nonInteractive: true,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 400,
      height: 300,
      color: 0xff0000,
      alpha: 0,
    },
    { name: 'brandLogo', type: 'Sprite', image: 'brandLogo', x: 200, y: 120, anchor: { x: 0.5, y: 0.5 } },
    {
      name: 'loadingText',
      type: 'Text',
      content: 'waitText',
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0xffffff },
      anchor: { x: 0.5, y: 0.5 },
      x: 200,
      y: 270,
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.5 },
    Portrait: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.4 },
    Landscape: { hAlign: 'center', vAlign: 'middle', maxScale: 1, widthPerc: 0.25 },
  },
};
