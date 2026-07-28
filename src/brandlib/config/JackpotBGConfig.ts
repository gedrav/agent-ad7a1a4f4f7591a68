import { JackpotGameBGComp } from '@brand/views/comps/JackpotGameBGComp';

export const JACKPOT_GAME_BG_CONFIG: any = {
  name: 'jackpotGameBG',
  type: 'Comp',
  class: JackpotGameBGComp,
  Elements: [
    {
      name: 'jackpotBG',
      type: 'DualSprite',
      image: 'jpBG',
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
  ],
};
