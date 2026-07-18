import { WinTicker } from '@core/views/comps/WinTicker';
import { BigWinsComp } from '@brand/views/comps/BigWinsComp';
import { TransitionAnimComp } from '@slots/meowmeowmeow/views/comps/TransitionAnimComp';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const MMM_TRANSITION_CONFIG = {
  name: 'transitionComp',
  type: 'Comp',
  class: TransitionAnimComp,
  requiredBundle: LOAD_CONSTANTS.SECONDARY,
  Elements: [
    {
      name: 'bg',
      type: 'Sprite',
      image: 'featureBG',
      layoutData: {
        Desktop: {
          hAlign: 'center',
          vAlign: 'middle',
          fitToScreen: true,
        },
      },
    },
    {
      name: 'door',
      type: 'Sprite',
      image: 'castleDoor',
      layoutData: {
        Desktop: {
          hAlign: 'center',
          vAlign: 'middle',
          fitToScreen: true,
        },
      },
    },
  ],
};
