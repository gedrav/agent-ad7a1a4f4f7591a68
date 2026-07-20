import { WheelFeatureComp } from '@slots/meowmeowmeow/views/comps/WheelFeature';

export const WHEEL_CONFIG: any = {
  name: 'wheelContainer',
  type: 'Comp',
  class: WheelFeatureComp,
  layoutData: {
    Desktop: { scale: 1, x: 1130, y: 1500 },
    Portrait: { scale: 1.2, x: 70, y: 100 },
    Landscape: { scale: 1, x: 469, y: 100 },
  },
  Elements: [
    {
      name: 'wheelBG',
      type: 'Sprite',
      image: 'WheelTest',
      anchor: { x: 0.5, y: 0.5 },
      x: 0,
      y: 0,
      scale: 2,
    },
  ],
};
