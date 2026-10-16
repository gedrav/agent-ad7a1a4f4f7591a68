import { WheelFeatureComp } from '@game/views/comps/WheelFeatureComp';

export const WHEEL_FEATURE_CONFIG = {
  name: 'wheelComp',
  type: 'Comp',
  class: WheelFeatureComp,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1000, height: 1020, color: 0x222831, x: 0, y: 0, alpha: 0 },
    {
      name: 'backAnim',
      type: 'Spine',
      spineName: 'wheel',
      defaultSkin: 'default',
      defaultState: 'back_fx',
      x: 500,
      y: 505,
      scale: 1.05,
    },
    { name: 'wheelBase', type: 'Sprite', image: 'wheelBase', anchor: { x: 0.5, y: 0.5 }, x: 500, y: 510 },
    { name: 'wheelSpin', type: 'Sprite', image: 'wheelSpin', anchor: { x: 0.5, y: 0.5 }, x: 513, y: 425 },
    { name: 'startButton', type: 'Sprite', image: 'startButton', anchor: { x: 0.5, y: 0.5 }, x: 512, y: 425 },
    { name: 'startButton2', type: 'Sprite', image: 'startButton2', anchor: { x: 0.5, y: 0.5 }, x: 512, y: 425 },
    { name: 'pointer', type: 'Sprite', image: 'pointer', anchor: { x: 0.5, y: 0.3 }, x: 512, y: 40 },
    { name: 'winFx', type: 'Spine', spineName: 'wheel', defaultSkin: 'default', defaultState: 'fx' },
    { name: 'starAnim', type: 'Spine', spineName: 'wheel', defaultSkin: 'default', defaultState: 'star' },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.85, heightPerc: 0.97, hAlign: 'center', vAlign: 'middle', maxScale: 1, vPaddingPerc: 0 },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.1 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
