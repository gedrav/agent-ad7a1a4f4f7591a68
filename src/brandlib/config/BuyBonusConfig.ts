import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { IncrementDecrementBetCommand } from '@core/commands/action/IncrementDecrementBetCommand';
import { CloseBuyBonusCommand } from '@core/commands/action/CloseBuyBonusCommand';
import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { BuyBonusConfirmedCommand } from '@core/commands/action/BuyBonusConfirmedCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { UIUtil } from '@core/utils/UIUtilService';

export const BUY_BONUS_CONFIG = {
  name: 'buyBonusView',
  type: 'Comp',
  class: BuyBonusView,
  isDesktopOnly: true,
  Elements: [
    {
      name: 'buyBonusBg',
      type: 'ResponsiveGraphics',
      image: 'shortPanelBG',
      width: 1424,
      height: 1728,
      radius: 32,
      color: 0xff0000,
    },
    {
      name: 'elementsContainer',
      type: 'Container',
      Elements: [
        {
          name: 'titleText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          content: 'buyFreeSpinTitle',
          style: { fontFamily: 'commonFont', fontSize: 50, fill: 0xffffff, fontWeight: 700 },
          x: 712,
          y: 4,
        },
        {
          name: 'buyFreeSpinsValueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          contentText: '',
          style: { fontFamily: 'commonFont', fontSize: 50, fill: 0xffffff, fontWeight: 700 },
          x: 712,
          y: 1400,
        },
        {
          name: 'cancelBtn',
          type: 'Button',
          scale: 1,
          action: {
            press: CloseBuyBonusCommand,
          },
          data: false,
          options: {
            defaultView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x000000 }),
            hoverView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x000000 }),
            pressedView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x000000 }),
            disabledView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xcccccc }),
            animations: CoreUIConfig.buttonStates,
          },
          textConfig: {
            name: 'closeBtn1Text',
            type: 'Text',
            content: 'cancelText',
            style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 44, fontWeight: 700 },
          },
          x: 462,
          y: 1540,
        },
        {
          name: 'startBtn',
          type: 'Button',
          scale: 1,
          action: {
            press: BuyBonusConfirmedCommand,
          },
          data: true,
          options: {
            defaultView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xffffff }),
            hoverView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xffffff }),
            pressedView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xffffff }),
            disabledView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xcccccc }),
            animations: CoreUIConfig.buttonStates,
          },
          textConfig: {
            name: 'closeBtn1Text',
            type: 'Text',
            content: 'buyBonusBtnText',
            style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 44, fontWeight: 700 },
          },
          x: 962,
          y: 1540,
        },
      ],
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, heightPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
