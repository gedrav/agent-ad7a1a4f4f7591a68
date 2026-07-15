import { KittieBankComp } from '../../views/comps/KittieBankComp';
import { KittieItemComp } from '@slots/meowmeowmeow/views/comps/KittieItemComp';

export const KITTIEBANK_CONFIG: any = {
  name: 'kittiebankComp',
  type: 'Comp',
  class: KittieBankComp,
  layoutData: {
    Desktop: { x: 0, y: 58 },
    Portrait: { x: 200, y: 520 },
    Landscape: { x: 0, y: 0 },
  },
  Elements: [
    {
      name: 'meow',
      type: 'Spine',
      spineName: 'kittiebank',
      defaultState: '3_RED_Static',
      loop: true,
      scale: 0.42,
      x: 226,
      y: 362,
      px: 606,
      py: 290,
      lx: 196,
      ly: 362,
    },

    {
      name: 'mew',
      type: 'Spine',
      spineName: 'kittiebank',
      defaultState: '2_BLUE_Static',
      loop: true,
      scale: 0.44,
      x: 216,
      y: 806,
      px: 190,
      py: 290,
      lx: 190,
      ly: 1218,
    },
    {
      name: 'mii',
      type: 'Spine',
      spineName: 'kittiebank',
      defaultState: '1_GREEN_Static',
      loop: true,
      scale: 0.5,
      x: 216,
      y: 1216,
      px: 1006,
      py: 290,
      lx: 188,
      ly: 808,
    },
  ],
};
