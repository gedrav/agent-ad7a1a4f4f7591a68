import { JackpotCardsComp } from '@brand/views/comps/JackpotCardsComp';
import { JACKPOT_GAME_BG_CONFIG } from './JackpotBGConfig';

export const JACKPOT_CARD_CONFIG: any = {
  name: 'jackpotCardContainer',
  type: 'Comp',
  class: JackpotCardsComp,
  cardsConfig: {
    maxRow: 2,
    maxcCol: 6,
    rowGap: 50,
    colGap: 50,
    cardWidth: 250,
    cardHeight: 350,
    pRow: 3,
    pCol: 4,
    cardConfig: {
      card: {
        name: 'card',
        type: 'Spine',
        spineName: 'cards',
        defaultState: 'back',
        defaultSkin: 'bronze',
        scale: 1,
        x: 124,
        y: 174,
      },
      guideRect: { name: 'cardRect', type: 'Graphics', width: 250, height: 350, color: 0x000000, x: 0, y: 0, alpha: 0 },
    },
  },
  Elements: [
    JACKPOT_GAME_BG_CONFIG,
    {
      name: 'cardsContainer',
      type: 'Container',
      x: 0,
      y: 0,
      Elements: [
        {
          name: 'guideRect',
          type: 'Graphics',
          color: 0x000000,
          width: 1755,
          height: 752,
          x: 0,
          y: 0,
          lWidth: 1755,
          lHeight: 752,
          pWidth: 1150,
          pHeight: 1168,
          alpha: 0,
        },
      ],
      layoutData: {
        Desktop: {
          widthPerc: 0.8,
          heightPerc: 0.8,
          hAlign: 'center',
          vAlign: 'middle',
          vPaddingPerc: 0.01,
          hPaddingPerc: 0,
        },
        Portrait: { widthPerc: 0.98, heightPerc: 0.98, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.02 },
        Landscape: {
          widthPerc: 0.7,
          heightPerc: 0.8,
          hAlign: 'center',
          vAlign: 'middle',
          vPaddingPerc: 0,
          hPaddingPerc: 0,
        },
        SmallLandscape: {
          widthPerc: 0.7,
          heightPerc: 0.8,
          hAlign: 'center',
          vAlign: 'middle',
          vPaddingPerc: 0,
          hPaddingPerc: 0,
        },
      },
    },
  ],
};
