import { WaysTextComp } from '@game/views/comps/WaysTextComp';

export const WAYS_TEXT_CONFIG = {
  name: 'transitionAnimComp',
  type: 'Comp',
  class: WaysTextComp,
  Elements: [
    { name: 'waysTextBg', type: 'Sprite', image: 'megaways_top', x: 0, y: 0, scale: { x: 0.5, y: 0.4 } },
    {
      name: 'megawaysText',
      type: 'Text',
      contentText: 'MEGAWAYS',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontFamily: 'gameFont1',
        fontSize: 52,
        fill: 0xffc21a,
        stroke: 0x006400,
        strokeThickness: 10,
        align: 'center',
      },
      x: 192,
      y: 62,
    },
    {
      name: 'megawaysCountText',
      type: 'BitmapText',
      contentText: '5040',
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'bitmapFont', fontSize: 120, fill: 0xffffff },
      x: 192,
      y: 110,
    },
  ],
};
