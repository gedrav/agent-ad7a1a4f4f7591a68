import { GameBGView } from '@game/views/containers/GameBGView';

export const GAME_BG_CONFIG: any = {
  name: 'gameBGView',
  type: 'Comp',
  class: GameBGView,
  Elements: [
    {
      name: 'maingameBG',
      type: 'Sprite',
      image: 'maingameBG',
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    {
      name: 'freegameBG',
      type: 'Sprite',
      image: 'maingameBG',
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    {
      name: 'bgAnim',
      type: 'Spine',
      spineName: 'BG',
      defaultState: 'bg_animation',
      loop: true,
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle' },
        Portrait: { hAlign: 'center', vAlign: 'middle' },
        Landscape: { hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
