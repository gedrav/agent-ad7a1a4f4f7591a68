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
    // Confirms the respin intro before the first feature request goes out - see TransitionComp
    // and EnterRespinState. Listed after transitionAnim so it draws on top of it, and hidden
    // until the transition animation finishes.
    // TODO: placeholder art/placement - lines_btn (197x175) is the only button-shaped sprite in
    // the gameplay bundle. Swap for the real OK button asset and position once available.
    {
      name: 'okBtnGroup',
      type: 'Container',
      visible: false,
      x: 515,
      y: 555,
      Elements: [
        { name: 'okBtn', type: 'Sprite', image: 'lines_btn', anchor: { x: 0.5, y: 0.5 }, x: 0, y: 0, scale: 1.4 },
        {
          name: 'okText',
          type: 'Text',
          contentText: 'OK',
          anchor: { x: 0.5, y: 0.5 },
          x: 0,
          y: 0,
          style: {
            fontFamily: 'gameFont1',
            fontWeight: 700,
            fill: [0xffed54, 0xf5a100],
            stroke: { color: 0x000000, width: 2 },
            fontSize: 60,
            anchor: { x: 0.5, y: 0.5 },
          },
        },
      ],
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
