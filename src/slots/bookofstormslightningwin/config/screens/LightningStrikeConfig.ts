import { LightningStrikeComp } from '@game/views/comps/LightningStrikeComp';

export const LIGHTNING_STRIKE_CONFIG: any = {
  name: 'lightningStrike',
  type: 'Comp',
  class: LightningStrikeComp,
  visible: false,
  layoutData: {
    Desktop: { scale: 1, vAlign: 'top', vPaddingPerc: 0.03 },
    Landscape: { scale: 0.5, vAlign: 'top', vPaddingPerc: 0.01 },
    Portrait: { scale: 0.5, vAlign: 'top', vPaddingPerc: 0.05 },
  },
};
