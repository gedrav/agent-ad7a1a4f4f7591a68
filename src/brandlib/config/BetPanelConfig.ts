import { BetPanelView } from '@brand/views/popups/BetPanelView';
import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { IncrementDecrementBetCommand } from '@core/commands/action/IncrementDecrementBetCommand';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const BET_PANEL_CONFIG = {
  name: 'betPanelView',
  type: 'Comp',
  class: BetPanelView,
  Elements: [
    {
      name: 'betPanelBg',
      type: 'RoundedRectangle',
      image: 'shortPanelBG',
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
      y: 80,
      content: 'betPanelTitle',
      toUpperCase: true,
      style: { fontFamily: 'commonFont', fontSize: 60, fill: 0x000000, fontWeight: 700 },
    },
    { name: 'btnContainer', type: 'Container', x: 0, y: 220 },
    {
      name: 'stakeChangeContainer',
      type: 'Container',
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
      name: 'closeBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBetPanelCommand,
      },
      options: {
        defaultView: 'cancelBtn_up',
        hoverView: 'cancelBtn_up',
        pressedView: 'cancelBtn_up',
        disabledView: 'cancelBtn_up',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtn1Text',
        type: 'Text',
        content: 'closeBtnText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 40 },
        toUpperCase: true,
      },
      x: 600,
      y: 680,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.7, heightPerc: 0.65, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
