import { LightningStrikeComp } from '@game/views/comps/LightningStrikeComp';

export const LIGHTNING_STRIKE_CONFIG: any = {
  name: 'lightningStrike',
  type: 'Comp',
  class: LightningStrikeComp,
  visible: false,
  layoutData: {
    Desktop: { scale: 1, hAlign: 'center', vAlign: 'top' },
    Landscape: { hAlign: 'center', vAlign: 'top', scale: 0.5 },
    Portrait: { hAlign: 'center', vAlign: 'top', scale: 0.5 },
  },
};
