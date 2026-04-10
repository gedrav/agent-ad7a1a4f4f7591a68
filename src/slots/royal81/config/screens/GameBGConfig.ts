import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Spine',
      spineName: 'BG_Animation_Spine',
      defaultState: 'idle',
      defaultSkin: 'Landscape',
      loop: true,
      boundingBox: { width: 3000, height: 1700 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
      },
    },
  ],
};
