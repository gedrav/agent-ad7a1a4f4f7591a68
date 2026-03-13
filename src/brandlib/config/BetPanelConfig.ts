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
      width: 712,
      height: 752,
      radius: 48,
      color: 0xdae9f7,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 356,
      y: 90,
      toUpperCase: true,
      content: 'betPanelTitle',
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0x000000, fontWeight: 700 },
    },
    {
      name: 'btnContainer',
      type: 'Container',
      x: 0,
      y: 190,
      Elements: [
        {
          name: 'stakeText',
          type: 'Text',
          contentText: '',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 40, fontWeight: 700 },
          x: 150,
          y: 0,
        },
        {
          name: 'downStakeBtn',
          type: 'Button',
          scale: 1,
          data: -1,
          action: {
            press: IncrementDecrementBetCommand,
          },
          options: {
            defaultView: 'minusBtn',
            hoverView: 'minusBtn',
            pressedView: 'minusBtn',
            disabledView: 'minusBtn',
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
            defaultView: 'plusBtn',
            hoverView: 'plusBtn',
            pressedView: 'plusBtn',
            disabledView: 'plusBtn',
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
        defaultView: 'cancelBtn',
        hoverView: 'cancelBtn',
        pressedView: 'cancelBtn',
        disabledView: 'cancelBtn',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'btnText',
        type: 'Text',
        content: 'cancelText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 28, fontWeight: 700 },
      },
      x: 520,
      y1: 1320,
      y: 700,
    },
    {
      name: 'setBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBetPanelCommand,
      },
      data: true,
      options: {
        defaultView: 'setBtn',
        hoverView: 'setBtn',
        pressedView: 'setBtn',
        disabledView: 'setBtn',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'btnText',
        type: 'Text',
        content: 'setText',
        style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 28, fontWeight: 700 },
      },
      x: 880,
      y: 700,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, heightPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
