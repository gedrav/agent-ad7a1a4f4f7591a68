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
    {
      name: 'coverRect',
      type: 'Graphics',
      width: 1660,
      height: 980,
      color: 0x000000,
      alpha: 0.5,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
  ],
};
