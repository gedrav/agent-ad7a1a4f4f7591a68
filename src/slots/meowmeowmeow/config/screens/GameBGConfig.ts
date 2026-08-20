import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Sprite',
      image: 'gameBG',
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.003, fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.16, fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
    {
      name: 'BGRed',
      type: 'Sprite',
      image: 'BGRed',
      visible: false,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.003, fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.16, fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
    {
      name: 'BGblue',
      type: 'Sprite',
      image: 'BGblue',
      visible: false,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.003, fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.16, fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
    {
      name: 'BGgreen',
      type: 'Sprite',
      image: 'BGgreen',
      visible: false,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.003, fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.16, fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
  ],
};
