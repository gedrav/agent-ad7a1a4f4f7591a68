import { PickBonusJackpotComp } from '@slots/meowmeowmeow/views/comps/pickBonusJackpot';
import { PICK_BONUS_JACKPOT_ICON_CONFIG } from './pickBonusjackpotIconCofig';

export const PICK_BONUS_JACKPOT_FEATURE_CONFIG: any = {
  name: 'pickjackpotContainer',
  type: 'Comp',
  class: PickBonusJackpotComp,
  layoutData: {
    Desktop: { scale: 1, x: 770, y: 560 },
    Portrait: { scale: 1, x: 462, y: 1160 },
    Landscape: { scale: 1, x: 770, y: 560 },
  },
  Elements: [
    {
      name: 'tapText',
      type: 'Text',
      visible: true,
      style: {
        fontFamily: 'gameFont2',
        fontSize: 100,
        fontWeight: '900',
        letterSpacing: 14,
        fill: ['0xFFF4C2', '0xFFD966', '0xFFB800', '0xE8890C'],
        fillGradientStops: [0, 0.35, 0.7, 1],
        stroke: '0x4A2700',
        strokeThickness: 12,
        dropShadow: true,
        dropShadowColor: '0x000000',
        dropShadowBlur: 2,
        dropShadowDistance: 6,
        align: 'center',
      },
      anchor: { x: 0.5, y: 0.5 },
      x: 445,
      y: 740,
    },
  ],
};
