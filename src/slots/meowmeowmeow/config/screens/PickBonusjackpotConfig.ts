import { PickBonusJackpotComp } from '@slots/meowmeowmeow/views/comps/pickBonusJackpot';
import { PICK_BONUS_JACKPOT_ICON_CONFIG } from './pickBonusjackpotIconCofig';

export const PICK_BONUS_JACKPOT_FEATURE_CONFIG: any = {
  name: 'pickjackpotContainer',
  type: 'Comp',
  class: PickBonusJackpotComp,
  layoutData: {
    Desktop: { scale: 1, x: 770, y: 460 },
  },
  Elements: [
    {
      name: 'tapText',
      type: 'Text',
      visible: true,
      style: {
        fontFamily: 'Showcard Gothic',
        fontSize: 100,
        fontWeight: '900',
        letterSpacing: 14,
        fill: ['#f523e0', '#f3ca14', '#f3ca14', '#f3ca14', '#f3ca14'],
        fillGradientStops: [0, 0.2, 0.45, 0.7, 0.9],
        stroke: '0xffea00',
        strokeThickness: 0,
        dropShadow: true,
        dropShadowColor: '0x000000',
        dropShadowBlur: 2,
        dropShadowDistance: 6,
        align: 'center',
      },
      anchor: { x: 0.5, y: 0.5 },
      x: 445,
      y: 790,
    },
  ],
};
