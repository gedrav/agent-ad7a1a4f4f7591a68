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
      type: 'NineSliceSprite',
      image: 'popupbg',
      nineSlice: [32, 32, 32, 32],
      lWidth: 1184,
      lHeight: 544,
      pWidth: 712,
      pHeight: 752,
      width: 712,
      height: 752,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 356,
      y: 90,
      toUpperCase: true,
      content: 'betPanelTitle',
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0xffffff, fontWeight: 700 },
    },
    {
      name: 'btnContainer',
      type: 'Container',
      x: 0,
      y: 190,
      Elements: [],
    },
    {
      name: 'stakeContainer',
      type: 'Container',
      Elements: [
        { name: 'stakebg', type: 'Sprite', image: 'inputBG', x: 0, y: 0 },
        {
          name: 'stakeText',
          type: 'Text',
          contentText: '',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 40, fontWeight: 700 },
          x: 279,
          y: 40,
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
          x: 60,
          y: 40,
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
          x: 500,
          y: 40,
        },
        { name: 'minmaxbetBG', type: 'Sprite', image: 'minmaxbetBG', x: 69, y: 100 },
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
        defaultView: 'okBtn',
        hoverView: 'okBtn',
        pressedView: 'okBtn',
        disabledView: 'okBtn',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'btnText',
        type: 'Text',
        content: 'setText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 28, fontWeight: 700 },
      },
      x: 880,
      y: 700,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.3, heightPerc: 0.58, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
