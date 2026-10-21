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
      box2: -20, // FREESPIN
      box3: 16, // MYSTERY
      box4: 50, // WILD
      box5: 40, // MEGA
    },
    title: {
      fontFamily: 'gameFont1',
      fontWeight: '900',
      fontSize: 125,
      y: -120,
      align: 'center',
      stroke: { color: '#1a0b00', width: 10, join: 'round' },
      dropShadow: { alpha: 0.95, angle: Math.PI / 2, blur: 1, color: '#000000', distance: 5 },
    },
    value: {
      fontFamily: 'gameFont1',
      fontWeight: '900',
      fontSize: 240,
      y: 60,
      align: 'center',
      stroke: { color: '#1a0b00', width: 8, join: 'round' },
      dropShadow: { alpha: 0.9, angle: Math.PI / 2, blur: 2, color: '#000000', distance: 4 },
    },
  },

  Elements: [
    {
      name: 'box1',
      type: 'Spine',
      spineName: 'MD_minecarts',
      defaultSkin: '1_Green',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 0,
      y: 0,
    },
    {
      name: 'box2',
      type: 'Spine',
      spineName: 'MD_minecarts',
      defaultSkin: '2_Yellow',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 880,
      y: 0,
    },
    {
      name: 'box3',
      type: 'Spine',
      spineName: 'MD_minecarts',
      defaultSkin: '3_Pink',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 1760,
      y: 0,
    },
    {
      name: 'box4',
      type: 'Spine',
      spineName: 'MD_minecarts',
      defaultSkin: '4_Red',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 2640,
      y: 0,
    },
    {
      name: 'box5',
      type: 'Spine',
      spineName: 'MD_minecarts_goldcart',
      defaultSkin: 'default',
      defaultState: 'Normal/Gem0',
      loop: false,
      x: 3520,
      y: 0,
    },
  ],
};
