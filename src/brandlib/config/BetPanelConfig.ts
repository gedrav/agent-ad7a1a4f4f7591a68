import { BetPanelView } from '@brand/views/popups/BetPanelView';
import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { IncrementDecrementBetCommand } from '@core/commands/action/IncrementDecrementBetCommand';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { AutoPlayChangeToggleBtnCommand } from '@core/commands/action/AutoPlayChangeToggleBtnCommand';
import { UIUtil } from '@core/utils/UIUtilService';

export const BET_PANEL_CONFIG = {
  name: 'betPanelView',
  type: 'Comp',
  class: BetPanelView,
  Elements: [
    {
      name: 'betPanelBg',
      type: 'ResponsiveGraphics',
      image: 'shortPanelBG',
      lWidth: 2800,
      lHeight: 1424,
      width: 1424,
      height: 1728,
      radius: 32,
      color: 0xdae9f7,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 712,
      y: 150,
      toUpperCase: true,
      content: 'betPanelTitle',
      style: { fontFamily: 'commonFont', fontSize: 60, fill: 0x000000, fontWeight: 700 },
    },
    {
      name: 'btnContainer',
      type: 'Container',
      x: 0,
      y: 350,
      Elements: [
        {
          name: 'stakeText',
          type: 'Text',
          contentText: '',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 60, fontWeight: 700 },
          x: 300,
          y: 0,
        },
        {
          name: 'downStakeBtn',
          type: 'IconButton',
          scale: 1,
          data: -1,
          action: {
            press: IncrementDecrementBetCommand,
          },
          options: {
            defaultView: 'plusMinusBtn',
            hoverView: 'plusMinusBtn',
            pressedView: 'plusMinusBtn',
            disabledView: 'plusMinusBtn',
            icon: 'minusIcon',
            animations: CoreUIConfig.buttonStates,
          },
          x: 0,
          y: 0,
        },

        {
          name: 'upStakeBtn',
          type: 'Button',
          scale: 1,
          data: 1,
          action: {
            press: IncrementDecrementBetCommand,
          },
          options: {
            defaultView: 'plusMinusBtn',
            hoverView: 'plusMinusBtn',
            pressedView: 'plusMinusBtn',
            disabledView: 'plusMinusBtn',
            icon: 'plusIcon',
            animations: CoreUIConfig.buttonStates,
          },
          x: 600,
          y: 0,
        },
      ],
    },
    {
      name: 'cancelBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBetPanelCommand,
      },
      data: false,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        hoverView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        pressedView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        disabledView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtn1Text',
        type: 'Text',
        content: 'cancelText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 44, fontWeight: 700 },
      },
      x: 520,
      y: 1540,
    },
    {
      name: 'startBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBetPanelCommand,
      },
      data: true,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x9ac1f4 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x9ac1f4 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x9ac1f4 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x9ac1f4 }),
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtn1Text',
        type: 'Text',
        content: 'setText',
        style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 44, fontWeight: 700 },
      },
      x: 880,
      y: 1540,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, heightPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
