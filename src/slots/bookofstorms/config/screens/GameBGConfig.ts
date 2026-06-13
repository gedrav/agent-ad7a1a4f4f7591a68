import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Spine',
      spineName: 'bg',
      defaultState: 'animation',
      defaultSkin: 'day',
      loop: true,
      boundingBox: { width: 1550, height: 1550 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'top', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'top', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'top', fitToScreen: true },
      },
    },
  ],
};
