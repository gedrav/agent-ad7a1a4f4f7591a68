import { TransitionAnimComp } from '@game/views/comps/TransitionAnimComp';

export const TRANSITION_ANIM_CONFIG = {
  name: 'transitionAnimComp',
  type: 'Comp',
  class: TransitionAnimComp,
  coverDelay: 1300,
  Elements: [
    {
      name: 'modalRect',
      type: 'Graphics',
      width: 1284,
      height: 2154,
      color: 0x000000,
      alpha: 0,
      layoutData: {
        Desktop: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
        Landscape: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
        Portrait: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
      },
    },
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 1400,
      height: 700,
      color: 0xffff00,
      alpha: 0,
    },

    {
      name: 'transitionAnim',
      type: 'Spine',
      spineName: 'Transition',
      defaultSkin: 'default',
      boundingBox: { width: 3000, height: 1440 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1.1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1.1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1.1 },
      },
    },
  ],

  layoutData: {
    Desktop: { hAlign: 'left', vAlign: 'top' },
    Portrait: { hAlign: 'left', vAlign: 'top' },
    Landscape: { hAlign: 'left', vAlign: 'top' },
  },
};
