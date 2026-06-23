import { KittieBankComp } from '../../views/comps/KittieBankComp';

export const KITTIEBANK_CONFIG: any = {
  name: 'kittiebankContainer',
  type: 'Comp',
  class: KittieBankComp,
  layoutData: {
    Desktop: { x: 0, y: 0 },
    Portrait: { x: -400, y: 0 },
    Landscape: { x: -300, y: 0 },
  },
  Elements: [
    { name: 'mii', type: 'Sprite', image: 'MII', x: 75, y: 36 },
    { name: 'mew', type: 'Sprite', image: 'MEW', x: 56, y: 470 },
    { name: 'meow', type: 'Sprite', image: 'MEOW', x: 0, y: 938 },
  ],
};
