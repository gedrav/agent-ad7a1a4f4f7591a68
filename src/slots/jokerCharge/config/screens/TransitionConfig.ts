import { TransitionComp } from '@slots/jokerCharge/views/comps/TransitionComp';

// TODO: placeholder size - replace with the real spine's dimensions once known (affects centering
// only, not rendering).
const GUIDE_SIZE = 1000;

export const TRANSITION_CONFIG: any = {
  name: 'transition',
  type: 'Comp',
  class: TransitionComp,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: GUIDE_SIZE,
      height: GUIDE_SIZE,
      x: -GUIDE_SIZE / 2,
      y: -GUIDE_SIZE / 2,
      color: 0xff0000,
      alpha: 0,
    },
    {
      name: 'transitionAnim',
      type: 'Spine',
      spineName: 'transition',
      x: 515,
      y: 555,
    },
  ],
  // TransitionComp extends ResponsiveView, which only repositions itself on resize, not its
  // children - so layoutData must live here on the outer Comp, not on transitionAnim.
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'middle' },
    Portrait: { hAlign: 'center', vAlign: 'middle' },
    Landscape: { hAlign: 'center', vAlign: 'middle' },
  },
};
