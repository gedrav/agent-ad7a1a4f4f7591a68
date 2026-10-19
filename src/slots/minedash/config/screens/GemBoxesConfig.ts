import { GemBoxesComp } from '@game/views/comps/GemBoxesComp';

export const GEM_BOXES_CONFIG: any = {
  name: 'boxesContainer',
  type: 'Comp',
  class: GemBoxesComp,
  x: 155,
  y: 865,
  px: 155,
  py: 865,
  scale: 0.3,
  labelStyle: {
    xOffsets: {
      box1: -20, // MULTI
      box2: -30, // FREESPIN
      box3: 10, // MYSTERY
      box4: 20, // WILD
      box5: -4, // MEGA (no label drawn)
    },
    title: {
      fontFamily: 'gameFont1',
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: { color: 0x110500, width: 8 },
      fontSize: 125,
      y: -90,
    },
    value: {
      fontFamily: 'gameFont1',
      fontWeight: 'bold',
      fontSize: 200,
      fill: 0xffea00,
      stroke: { color: 0x110500, width: 8 },
      y: 90,
    },
  },

  Elements: [
    {
      name: 'box1',
      type: 'Spine',
      spineName: 'Minecart',
      defaultSkin: '1_Green',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 0,
      y: 0,
    },
    {
      name: 'box2',
      type: 'Spine',
      spineName: 'Minecart',
      defaultSkin: '2_Yellow',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 880,
      y: 0,
    },
    {
      name: 'box3',
      type: 'Spine',
      spineName: 'Minecart',
      defaultSkin: '3_Pink',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 1760,
      y: 0,
    },
    {
      name: 'box4',
      type: 'Spine',
      spineName: 'Minecart',
      defaultSkin: '4_Red',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 2640,
      y: 0,
    },
    {
      name: 'box5',
      type: 'Spine',
      spineName: 'MinecartGoldCard',
      defaultSkin: 'default',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 3520,
      y: 0,
    },
  ],
};
