import { KittieBankComp } from '../../views/comps/KittieBankComp';
import { KittieItemComp } from '@slots/meowmeowmeow/views/comps/KittieItemComp';

export const KITTIEBANK_CONFIG: any = {
  name: 'kittiebankComp',
  type: 'Comp',
  class: KittieBankComp,
  layoutData: {
    Desktop: { x: 0, y: 0 },
    Portrait: { x: 200, y: 520 },
    Landscape: { x: 0, y: 0 },
  },
  Elements: [
    {
      name: 'meow',
      type: 'Comp',
      class: KittieItemComp,
      x: 0,
      y: 0,
      px: 410,
      py: 0,
      lx: 0,
      ly: 0,
      Elements: [{ name: 'MII', type: 'Sprite', image: 'MEOW' }],
    },
    {
      name: 'mew',
      type: 'Comp',
      class: KittieItemComp,
      x: 0,
      y: 458,
      px: 818,
      py: 0,
      lx: 0,
      ly: 458,
      Elements: [{ name: 'MII', type: 'Sprite', image: 'MEW' }],
    },
    {
      name: 'mii',
      type: 'Comp',
      class: KittieItemComp,
      x: 0,
      y: 902,
      px: 0,
      py: 0,
      lx: 0,
      ly: 902,
      Elements: [{ name: 'MII', type: 'Sprite', image: 'MII' }],
    },
  ],
};
