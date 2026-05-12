import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Spine',
      spineName: 'BG_king',
      defaultState: 'day',
      freespinState: 'night',
      loop: true,
      boundingBox: { width: 1540, height: 1540 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true, fullScreenScale: 1.4 },
        DesktopPortrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true, fullScreenScale: 1.5 },
        Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true },
      },
    },
  ],
};
