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
      freespinState: 'bonus',
      loop: true,
      boundingBox: { width: 1550, height: 1550 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'bottom', fitToScreen1: true },
        Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
      },
    },
  ],
};
