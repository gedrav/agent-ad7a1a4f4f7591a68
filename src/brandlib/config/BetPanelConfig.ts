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
      type: 'Sprite',
      image: 'shortPanelBG',
    },
    {
      name: 'titleText1',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 600,
      y: 100,
      content: 'betPanelTitle',
      toUpperCase: true,
      style: { fontFamily: 'commonFontBold', fontSize: 60, fill: 0xffffff },
    },

    {
      name: 'btn1',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn1Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 200,
      y: 260,
    },
    {
      name: 'btn2',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn2Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 470,
      y: 260,
    },
    {
      name: 'btn3',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn3Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 740,
      y: 260,
    },
    {
      name: 'btn4',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn4Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 1000,
      y: 260,
    },
    {
      name: 'btn5',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn5Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 200,
      y: 400,
    },
    {
      name: 'btn6',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn6Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 470,
      y: 400,
    },
    {
      name: 'btn7',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn7Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 740,
      y: 400,
    },
    {
      name: 'btn8',
      type: 'PixToggleButton',
      scale: 1,
      action: {
        press: ChangeTotalBetCommand,
      },
      options: {
        defaultView: 'betSelection_up',
        hoverView: 'betSelection_up',
        pressedView: 'betSelection_up',
        disabledView: 'betSelection_up',
        animations: CoreUIConfig.buttonStates,
      },
      selectedOptions: {
        defaultView: 'betSelection_selected_up',
        hoverView: 'betSelection_selected_up',
        pressedView: 'betSelection_selected_up',
        disabledView: 'betSelection_selected_up',
      },
      textConfig: {
        name: 'btn8Text',
        type: 'Text',
        contentText: '',
        style: {
          fontFamily: 'commonFontBold',
          fontSize: 50,
          nonSelectedStateColor: 0xffffff,
          selectedStateColor: 0x8af5fa,
        },
      },
      x: 1000,
      y: 400,
    },
    {
      name: 'stakeDisplay',
      type: 'Sprite',
      image: 'betShownBG_up',
      x: 600,
      y: 540,
      anchor: { x: 0.5, y: 0.5 },
    },

    {
      name: 'stakeText',
      type: 'Text',
      contentText: '',
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFontBold', fill: 0xffffff, fontSize: 50 },
      x: 600,
      y: 536,
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
        defaultView: 'stakeBtnDown_up',
        hoverView: 'stakeBtnDown_up',
        pressedView: 'stakeBtnDown_up',
        disabledView: 'stakeBtnDown_up',
        animations: CoreUIConfig.buttonStates,
      },
      x: 220,
      y: 540,
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
        defaultView: 'stakeBtnUp_up',
        hoverView: 'stakeBtnUp_up',
        pressedView: 'stakeBtnUp_up',
        disabledView: 'stakeBtnUp_up',
        animations: CoreUIConfig.buttonStates,
      },
      x: 950,
      y: 540,
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
        style: { fontFamily: 'commonFontBold', fill: 0xffffff, fontSize: 40 },
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
