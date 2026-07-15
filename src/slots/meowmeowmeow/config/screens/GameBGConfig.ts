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
      boundingBox: { width: 1900, height: 1280 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 1 },
      },
    },
  ],
};
