import { TransitionAnimComp } from '@game/views/comps/TransitionAnimComp';

export const TRANSITION_ANIM_CONFIG = {
  name: 'transitionAnimComp',
  type: 'Comp',
  class: TransitionAnimComp,
  Elements: [
    // { name: 'guideRect', type: 'Graphics', width: 1610, height: 1190, color: 0xffff00, x: 0, y: 0, alpha: 0 },
    {
      name: 'transition',
      type: 'Spine',
      spineName: 'Transition',
      defaultState: 'horisontal',
      loop: true,
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'top', fitToScreen: true },
    Portrait: { hAlign: 'center', vAlign: 'top', fitToScreen: true },
    Landscape: { hAlign: 'center', vAlign: 'top', fitToScreen: true },
  },
};
