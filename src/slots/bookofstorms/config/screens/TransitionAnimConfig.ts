import { TransitionAnimComp } from '@game/views/comps/TransitionAnimComp';

export const TRANSITION_ANIM_CONFIG = {
  name: 'transitionAnimComp',
  type: 'Comp',
  class: TransitionAnimComp,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 1400,
      height: 700,
      color: 0xffff00,
      alpha: 0,
    },
    {
      name: 'transitionAnimHor',
      type: 'Spine',
      spineName: 'Transition',
      defaultState: 'horisontal',
      scale: 1,
    },
    {
      name: 'transitionAnimVer',
      type: 'Spine',
      spineName: 'Transition',
      defaultState: 'vertical',
      scale: 1,
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
    Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
    Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
  },
};
