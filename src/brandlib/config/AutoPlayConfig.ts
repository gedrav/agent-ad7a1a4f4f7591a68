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
      width: 1424,
      height: 1512,
      radius: 96,
      color: 0xdae9f7,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 712,
      y: 180,
      toUpperCase: true,
      content: 'autoplayTitle',
      style: { fontFamily: 'commonFont', fontSize: 80, fill: 0x000000, fontWeight: 700 },
    },

    {
      name: 'numberSelectionContainer',
      type: 'ResponsiveChildrenContainer',
      y: 400,
      Elements: [
        {
          name: 'numberOfSpinsText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          x: 712,
          y: 0,
          content: 'noOfSpins',
          style: { fontFamily: 'commonFont', fontSize: 60, fill: 0x000000, fontWeight: 500 },
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
              fontSize: 50,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 180,
          y: 160,
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
              fontSize: 50,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 444,
          y: 160,
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
              fontSize: 50,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 708,
          y: 160,
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
              fontSize: 50,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 980,
          y: 160,
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
              fontSize: 50,
              fontWeight: 700,
              nonSelectedStateColor: 0x000000,
              selectedStateColor: 0xffffff,
            },
          },
          x: 1230,
          y: 160,
        },
      ],
    },
    {
      name: 'sliderContainer',
      type: 'ResponsiveChildrenContainer',
      x: 0,
      y: 800,

      Elements: [
        {
          name: 'spendingLimitText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          x: 712,
          y: 0,
          content: 'spendingLimitText',
          style: { fontFamily: 'commonFont', fontSize: 60, fill: 0x000000, fontWeight: 500 },
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
            initialColor: 0xcccccc,
            updatedColor: 0xffffff,
            fontSize: 40,
          },
          valueTextOffset: { y: -47 },
          valueTextAnchor: { x: 1, y: 0.5 },
          x: 90,
          y: 280,
          bgWidth: 940,
          bgHeight: 32,
          Elements: [
            {
              name: 'singleWinSliderLabel',
              type: 'Text',
              content: 'singWinExceedsText',
              style: { fontFamily: 'commonFont', fontSize: 50, fill: 0x000000 },
              anchor: { x: 0, y: 0.5 },
              x: 0,
              y: -47,
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
      y: 1320,
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
        content: 'startBtnText',
        style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 44, fontWeight: 700 },
      },
      x: 880,
      y: 1320,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.48, heightPerc: 0.48, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
