import { WinCollectorComp } from '@game/views/comps/WinCollectorComp';
import { UIConfig } from '../UIConfig';
import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';
import { Point } from 'pixi.js';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';

export const BUY_BONUS_BTN_CONFIG: any = {
  name: 'bbBtn',
  type: 'Button',
  x: 180,
  y: 1432,
  px: 140,
  py: 1978,
  lx: 180,
  ly: 1260,
  scale: 0.9,
  action: {
    press: BuyBonusClickCommand,
  },
  data: { id: 'FG1' },
  options: {
    defaultView: 'bbBtn',
    hoverView: 'bbBtn',
    pressedView: 'bbBtn',
    disabledView: 'bbBtn',
    textOffset: new Point(0, 2),
    animations: CoreUIConfig.spinButtonStates,
  },
  textConfig: {
    name: 'bbBtn',
    type: 'Text',
    content: 'BuyText',
    style: {
      fontFamily: 'gameFont1',
      fill: 0xffffff,
      fontSize: 50,
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: 200,
      align: 'center',
    },
  },
};
