import { WinCollectorComp } from '@game/views/comps/WinCollectorComp';
import { UIConfig } from '../../../empireofgoldOld/config/UIConfig';
import { MultiComp } from '@game/views/comps/MultiComp';

export const EMPIRE_MULTIPLIER_CONFIG: any = {
  name: 'multiplierComp',
  type: 'Comp',
  class: MultiComp,
  x: 300,
  y: 8,
  px: 14,
  py: 340,
  lx: 300,
  ly: 8,
  Elements: [{ name: 'winCollectorBg', type: 'Sprite', image: 'mult_collect', x: 0, y: 0 }],
};
