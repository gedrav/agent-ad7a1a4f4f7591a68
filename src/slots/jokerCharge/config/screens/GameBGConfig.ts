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
      defaultState: 'idle_active',
      defaultSkin: 'default',
      loop: true,
      // The art is 3732x3486 and sits centred in this box, so the box is narrower and much shorter
      // than what actually draws. fitToScreen covers the box, not the art, which is why portrait
      // needs fullScreenScale: there the box is height-bound and 1700/3486 of the art's real
      // height, making the background come out about twice the size it should be. 0.5 brings it
      // back to roughly cover. Every orientation is centred: the art overhangs the box vertically,
      // so aligning the box's bottom to the screen leaves the top of the screen bare.
      boundingBox: { width: 3000, height: 1700 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true, fullScreenScale: 0.5 },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
  ],
};
