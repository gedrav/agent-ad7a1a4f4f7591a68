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
      defaultSkin: 'default',
      defaultState: 'Day',
      freespinState: 'Night',
      loop: true,
      boundingBox: { width: 3920, height: 2655 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true, fullScreenScale: 1.1 },
        Portrait: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true, fullScreenScale: 1.1 },
        Landscape: { hAlign: 'center', vAlign: 'bottom', fitToScreen: true, fullScreenScale: 1.1 },
      },
    },
  ],
};
