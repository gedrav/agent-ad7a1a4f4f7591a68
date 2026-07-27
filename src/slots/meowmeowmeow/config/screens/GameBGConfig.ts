import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Sprite',
      image: 'maingamebg',
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
  ],
};
