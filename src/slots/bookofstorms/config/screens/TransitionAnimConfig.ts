import { ShowFSTransitionState } from '@game/states/ShowFSTransitionState';
import { TransitionAnimComp } from '@game/views/comps/TransitionAnimComp';

export const TRANSITION_ANIM_CONFIG = {
  name: 'transitionAnimComp',
  type: 'Comp',
  class: TransitionAnimComp,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 4000,
      height: 500,
      pWidth: 1420,
      pHeight: 4000,
      lWidth: 1610,
      lHeight: 1140,
      color: 0xffff00,
      alpha: 0,
    },
  ],
  layoutData: {
    Desktop: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle', fitToScreen: true },
    Portrait: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle', fitToScreen: true },
    Landscape: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle', fitToScreen: true },
  },
};
