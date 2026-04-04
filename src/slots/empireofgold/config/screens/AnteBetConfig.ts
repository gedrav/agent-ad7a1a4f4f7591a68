import { WinCollectorComp } from '@game/views/comps/WinCollectorComp';
import { UIConfig } from '../../../empireofgoldOld/config/UIConfig';
import { AnteBetComp } from '@game/views/comps/AnteBetComp';

export const ANTE_BET_CONFIG: any = {
  name: 'anteBetComp',
  type: 'Comp',
  class: AnteBetComp,
  x: 48,
  y: 500,
  px: 1132,
  py: 1840,
  lx: 48,
  ly: 500,
  scale: 0.9,
  Elements: [
    { name: 'anteBG', type: 'Sprite', image: 'ante_bg', x: 8, y: 12 },
    { name: 'anteFrame', type: 'Sprite', image: 'ante_frame_gold', x: 0, y: 0 },
  ],
  data: {
    H1: { name: 'H1', type: 'Sprite', image: 'H1' },
    H2: { name: 'H2', type: 'Sprite', image: 'H2' },
    H3: { name: 'H3', type: 'Sprite', image: 'H3' },
    H4: { name: 'H4', type: 'Sprite', image: 'H4' },
    L1: { name: 'L1', type: 'Sprite', image: 'L1' },
    L2: { name: 'L2', type: 'Sprite', image: 'L2' },
    L3: { name: 'L3', type: 'Sprite', image: 'L3' },
    L4: { name: 'L4', type: 'Sprite', image: 'L4' },
    L5: { name: 'L5', type: 'Sprite', image: 'L5' },
  },
};
