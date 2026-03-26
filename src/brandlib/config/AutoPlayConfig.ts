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
      type: 'NineSliceSprite',
      image: 'popupbg',
      nineSlice: [32, 32, 32, 32],
      lWidth: 712,
      lHeight: 752,
      pWidth: 712,
      pHeight: 752,
      width: 712,
      height: 752,
    },
    {
      name: 'titleText',
      type: 'Text',
      x: 356,
      y: 90,
      toUpperCase: true,
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0xffffff, fontWeight: 700 },
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
          style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 400 },
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
              nonSelectedStateColor: 0xffffff,
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
              nonSelectedStateColor: 0xffffff,
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
              nonSelectedStateColor: 0xffffff,
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
              nonSelectedStateColor: 0xffffff,
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
              nonSelectedStateColor: 0xffffff,
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
      py: 420,
      ly: 370,
      Elements: [
        {
          name: 'spendingLimitText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          x: 356,
          y: 0,
          content: 'spendingLimitText',
          style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 400 },
        },
        {
          name: 'spendingMinLimitText',
          type: 'Text',
          anchor: { x: 0, y: 0.5 },
          x: 96,
          y: 75,
          content: '',
          style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 400 },
        },
        {
          name: 'spendingMaxLimitText',
          type: 'Text',
          anchor: { x: 1, y: 0.5 },
          x: 484,
          y: 75,
          content: '',
          style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 400 },
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
          showValue: false,
          x: 90,
          y: 110,
          bgWidth: 400,
          bgHeight: 16,

          configData: {
            action: {
              change: AutoPlaySliderChangeCommand,
            },
            data: { type: 'singleWin' },
          },
        },
        {
          name: 'spendingLimitInput',
          type: 'Input',
          image: 'autoinputBG',
          x: 516,
          y: 77,
          options: {
            placeholder: '0',
            align: 'center',
            padding: 0,
            textStyle: { fontFamily: 'Mulish', fontSize: 28, fill: 0xffffff },
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
      y: 670,
      ly: 610,
      py: 730,
    },
    {
      name: 'startBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: AutoPlayConfirmBtnCommand,
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
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 28, fontWeight: 700 },
      },
      x: 432,
      y: 670,
      ly: 610,
      py: 730,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.3, heightPerc: 0.58, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
