import { TransitionComp } from '@game/views/comps/TransitionComp';

export const TRANSITION_CONFIG = {
  name: 'transitionView',
  type: 'Comp',
  class: TransitionComp,
  data: {
    transitionScreen1: {
      initialPos: -1220,
      finalPos: -130,
    },
    transitionScreen2: {
      initialPos: 2120,
      finalPos: 1060,
    },
  },
  Elements: [
    {
      name: 'transitionScreen1',
      type: 'Sprite',
      image: 'transitionScreen',
      anchor: { x: 0, y: 0 },
      y: 0,
      scale: 1,
    },
    {
      name: 'transitionScreen2',
      type: 'Sprite',
      image: 'transitionScreen',
      anchor: { x: 0, y: 0 },
      y: 0,
      scale: 1,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 1, heightPerc: 1, hAlign: 'left', vAlign: 'top', maxScale: 2, vPaddingPerc: 0 },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.1 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
