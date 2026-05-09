import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Spine',
      spineName: 'BG',
      defaultState: 'main',
      loop: true,
      boundingBox: { width: 1540, height: 1540 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
      },
    },
    {
      name: 'freegameBG',
      type: 'Spine',
      unload: false,
      spineName: 'BG',
      defaultState: 'bonus',
      loop: true,
      boundingBox: { width: 1540, height: 1540 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
      },
    },
  ],
};
