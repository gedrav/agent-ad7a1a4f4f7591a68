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
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.003, fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.16, fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
    {
      name: 'BGRed',
      type: 'Sprite',
      image: 'maingameRedBG.jpg',
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
      image: 'maingameBlueBG.jpg',
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
      image: 'maingameGreenBG.jpg',
      visible: false,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.003, fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: -0.16, fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
  ],
};
