import { LogoComp } from '@slots/jokerCharge/views/comps/LogoComp';

export const LOGO_CONFIG: any = {
  name: 'logoComp',
  type: 'Comp',
  class: LogoComp,
  Elements: [
    {
      name: 'logoAnim',
      type: 'Spine',
      spineName: 'logo',
      defaultState: 'idle',
      loop: true,
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'top', widthPerc: 0.3, heightPerc: 0.15, maxScale: 1 },
    Portrait: { hAlign: 'center', vAlign: 'top', widthPerc: 0.4, heightPerc: 0.12, maxScale: 1 },
    Landscape: { hAlign: 'center', vAlign: 'top', widthPerc: 0.25, heightPerc: 0.15, maxScale: 1 },
  },
};
