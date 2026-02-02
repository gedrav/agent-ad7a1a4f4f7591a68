import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Spine',
      spineName: 'bg_day',
      defaultSkin: 'default',
      defaultState: 'animation',
      boundingBox: { width: 1550, height: 1550 },
      loop: true,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    {
      name: 'freegameBG',
      type: 'Spine',
      spineName: 'bg_night',
      defaultSkin: 'default',
      defaultState: 'animation',
      boundingBox: { width: 1550, height: 1550 },
      loop: true,
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
  ],
};
