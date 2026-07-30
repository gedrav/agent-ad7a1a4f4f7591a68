import { PickBonusJackpotIconComp } from '@slots/meowmeowmeow/views/comps/pickBonusJackpotIcon';

export const PICK_BONUS_JACKPOT_ICON_CONFIG: any = {
  name: 'japot_Icon',
  type: 'Comp',
  class: PickBonusJackpotIconComp,
  Elements: [
    {
      name: 'jackpotIcon',
      type: 'Spine',
      spineName: 'Jackpot_Coin',
      animScale: 1,
      scale: 0.25,
      loop: false,
      defaultSkin: 'default',
    },
  ],
};
