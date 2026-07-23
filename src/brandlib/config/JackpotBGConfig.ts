import { JackpotGameBGComp } from '@brand/views/comps/JackpotGameBGComp';

export const JACKPOT_GAME_BG_CONFIG: any = {
  name: 'jackpotGameBG',
  type: 'Comp',
  class: JackpotGameBGComp,
  Elements: [{ name: 'guideRect', type: 'Graphics', color: '0x000000', width: 3000, height: 1440, alpha: 0.5 }],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
    Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
    Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
  },
};
