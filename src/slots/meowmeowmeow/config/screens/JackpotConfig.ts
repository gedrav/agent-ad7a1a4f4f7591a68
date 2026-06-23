import { JackpotComp } from '../../views/comps/JackpotComp';

export const JACKPOT_CONFIG: any = {
  name: 'jackpotContainer',
  type: 'Comp',
  class: JackpotComp,
  layoutData: {
    Desktop: { scale: 1, x: 469, y: 176 },
    Portrait: { scale: 1, x: -65, y: -150 },
    Landscape: { scale: 1, x: 25, y: 30 },
  },
  Elements: [
    { name: 'grand', type: 'Sprite', image: 'grand', x: 0, y: 0 },
    { name: 'major', type: 'Sprite', image: 'major', x: 418, y: 8 },
    { name: 'minor', type: 'Sprite', image: 'minor', x: 835, y: 10 },
    { name: 'mini', type: 'Sprite', image: 'mini', x: 1252, y: 10 },
  ],
};
