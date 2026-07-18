import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { TransitionAnimComp } from '@slots/meowmeowmeow/views/comps/TransitionAnimComp';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const MMM_TRANSITION_CONFIG = {
  name: 'transitionComp',
  type: 'Comp',
  class: TransitionAnimComp,
  requiredBundle: LOAD_CONSTANTS.SECONDARY,
  Elements: [
    {
      name: 'cont',
      type: 'Container',
      Elements: [
        { name: 'bg', type: 'Sprite', image: 'transitionBG', anchor: { x: 0.5, y: 0.5 }, x: 2045, y: 1384.5 },
        {
          name: 'door',
          type: 'Sprite',
          image: 'castle_door',
          x: 2034,
          y: 1409,
          anchor: { x: 0.5, y: 0.5 },
        },
        { name: 'castle', type: 'Sprite', image: 'castle', anchor: { x: 0.5, y: 0.5 }, x: 2045, y: 1384.5 },
      ],
    },
  ],
  layoutData: {
    Desktop: {
      hAlign: 'center',
      vAlign: 'middle',
      fitToScreen: true,
      fullScreenScale: 1.6,
    },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      x: 480,
      y: 294,
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 1,
      maxScale: 1,
      x: 480,
      y: 294,
    },
  },
};
