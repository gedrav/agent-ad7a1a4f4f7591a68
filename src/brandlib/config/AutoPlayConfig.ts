import { AutoplayView } from '@brand/views/popups/AutoplayView';
import { AutoPlayNoOfSpinsBtnCommand } from '@core/commands/action/AutoPlayNoOfSpinsBtnCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { AutoPlayChangeToggleBtnCommand } from '@core/commands/action/AutoPlayChangeToggleBtnCommand';
import { AutoPlaySliderChangeCommand } from '@core/commands/action/AutoPlaySliderChangeCommand';
import { AutoPlayCancelBtnCommand } from '@core/commands/action/AutoPlayCancelBtnCommand';
import { AutoPlayConfirmBtnCommand } from '@core/commands/action/AutoPlayConfirmBtnCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { UIUtil } from '@core/utils/UIUtilService';

export const AUTOPLAY_CONFIG = {
  name: 'autoplayView',
  type: 'Comp',
  class: AutoplayView,
  Elements: [
    {
      name: 'autoPanelBg',
      type: 'ResponsiveGraphics',
      image: 'shortPanelBG',
      width: 712,
      height: 752,
      radius: 48,
      color: 0xdae9f7,
    },
    {
      name: 'titleText',
      type: 'Text',
      x: 356,
      y: 90,
      toUpperCase: true,
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0x000000, fontWeight: 700 },
      content: 'autoplayTitle',
    },

    {
      name: 'numberSelectionContainer',
      type: 'ResponsiveChildrenContainer',
      y: 200,
      Elements: [
        {
          name: 'numberOfSpinsText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          x: 356,
          y: 0,
          content: 'noOfSpins',
          style: { fontFamily: 'commonFont', fontSize: 32, fill: 0x000000, fontWeight: 400 },
        },
        {
          name: 'btn1',
          type: 'PixToggleButton',
          scale: 1,
          action: {
            press: AutoPlayNoOfSpinsBtnCommand,
          },
          options: {
            defaultView: 'autoNumBtn',
            hoverView: 'autoNumBtn',
            pressedView: 'autoNumBtn',
            disabledView: 'autoNumBtn',
            animations: CoreUIConfig.buttonStates,
          },
          selectedOptions: {
            defaultView: 'autoNumSelectedBtn',
            hoverView: 'autoNumSelectedBtn',
            pressedView: 'autoNumSelectedBtn',
            disabledView: 'autoNumSelectedBtn',
          },
          textConfig: {
            name: 'btn1Text',
            type: 'Text',
            contentText: '',
            style: {
              fontFamily: 'commonFont',
              fontSize: 28,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 90,
          y: 80,
        },
        {
          name: 'btn2',
          type: 'PixToggleButton',
          scale: 1,
          pScale: 1,
          lScale: 1,
          action: {
            press: AutoPlayNoOfSpinsBtnCommand,
          },
          options: {
            defaultView: 'autoNumBtn',
            hoverView: 'autoNumBtn',
            pressedView: 'autoNumBtn',
            disabledView: 'autoNumBtn',
            animations: CoreUIConfig.buttonStates,
          },
          selectedOptions: {
            defaultView: 'autoNumSelectedBtn',
            hoverView: 'autoNumSelectedBtn',
            pressedView: 'autoNumSelectedBtn',
            disabledView: 'autoNumSelectedBtn',
          },
          textConfig: {
            name: 'btn2Text',
            type: 'Text',
            contentText: '',
            style: {
              fontFamily: 'commonFont',
              fontSize: 28,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 226,
          y: 80,
        },
        {
          name: 'btn3',
          type: 'PixToggleButton',
          scale: 1,
          pScale: 1,
          lScale: 1,

          action: {
            press: AutoPlayNoOfSpinsBtnCommand,
          },
          options: {
            defaultView: 'autoNumBtn',
            hoverView: 'autoNumBtn',
            pressedView: 'autoNumBtn',
            disabledView: 'autoNumBtn',
            animations: CoreUIConfig.buttonStates,
          },
          selectedOptions: {
            defaultView: 'autoNumSelectedBtn',
            hoverView: 'autoNumSelectedBtn',
            pressedView: 'autoNumSelectedBtn',
            disabledView: 'autoNumSelectedBtn',
          },
          textConfig: {
            name: 'btn3Text',
            type: 'Text',
            contentText: '',
            style: {
              fontFamily: 'commonFont',
              fontSize: 28,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 362,
          y: 80,
        },

        {
          name: 'btn4',
          type: 'PixToggleButton',
          scale: 1,
          pScale: 1,
          lScale: 1,

          action: {
            press: AutoPlayNoOfSpinsBtnCommand,
          },
          options: {
            defaultView: 'autoNumBtn',
            hoverView: 'autoNumBtn',
            pressedView: 'autoNumBtn',
            disabledView: 'autoNumBtn',
            animations: CoreUIConfig.buttonStates,
          },
          selectedOptions: {
            defaultView: 'autoNumSelectedBtn',
            hoverView: 'autoNumSelectedBtn',
            pressedView: 'autoNumSelectedBtn',
            disabledView: 'autoNumSelectedBtn',
          },
          textConfig: {
            name: 'btn4Text',
            type: 'Text',
            contentText: '',
            style: {
              fontFamily: 'commonFont',
              fontSize: 28,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 498,
          y: 80,
        },

        {
          name: 'btn5',
          type: 'PixToggleButton',
          scale: 1,
          pScale: 1,
          lScale: 1,

          action: {
            press: AutoPlayNoOfSpinsBtnCommand,
          },
          options: {
            defaultView: 'autoNumBtn',
            hoverView: 'autoNumBtn',
            pressedView: 'autoNumBtn',
            disabledView: 'autoNumBtn',
            animations: CoreUIConfig.buttonStates,
          },
          selectedOptions: {
            defaultView: 'autoNumSelectedBtn',
            hoverView: 'autoNumSelectedBtn',
            pressedView: 'autoNumSelectedBtn',
            disabledView: 'autoNumSelectedBtn',
          },
          textConfig: {
            name: 'btn5Text',
            type: 'Text',
            contentText: '',
            style: {
              fontFamily: 'commonFont',
              fontSize: 28,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 620,
          y: 80,
        },
      ],
    },
    {
      name: 'sliderContainer',
      type: 'ResponsiveChildrenContainer',
      x: 0,
      y: 400,

      Elements: [
        {
          name: 'spendingLimitText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          x: 356,
          y: 0,
          content: 'spendingLimitText',
          style: { fontFamily: 'commonFont', fontSize: 32, fill: 0x000000, fontWeight: 400 },
        },
        {
          name: 'spendingLimitSlider',
          type: 'Slider',
          bg: 'sliderbg',
          fill: 'sliderfill',
          slider: 'sliderknob',
          min: 0,
          max: 1000,
          step: 1,
          value: 0,
          showValue: true,
          valueTextStyle: {
            fontFamily: 'commonFont',
            initialColor: 0x000000,
            updatedColor: 0x000000,
            fontSize: 32,
          },
          valueTextOffset: { y: -47 },
          valueTextAnchor: { x: 1, y: 0.5 },
          x: 90,
          y: 90,
          bgWidth: 400,
          bgHeight: 16,
          Elements: [
            {
              name: 'singleWinSliderLabel',
              type: 'Text',
              content: 'singWinExceedsText',
              style: { fontFamily: 'commonFont', fontSize: 32, fill: 0x000000 },
              anchor: { x: 0, y: 0.5 },
              x: 0,
              y: -24,
            },
          ],
          configData: {
            action: {
              change: AutoPlaySliderChangeCommand,
            },
            data: { type: 'singleWin' },
          },
        },
      ],
    },

    {
      name: 'cancelBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: AutoPlayCancelBtnCommand,
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
      x: 270,
      y1: 1320,
      y: 660,
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
        defaultView: 'startBtn',
        hoverView: 'startBtn',
        pressedView: 'startBtn',
        disabledView: 'startBtn',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'btnText',
        type: 'Text',
        content: 'startBtnText',
        style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 28, fontWeight: 700 },
      },
      x: 432,
      y: 660,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.3, heightPerc: 0.6, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
