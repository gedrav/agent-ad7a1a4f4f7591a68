import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { IncrementDecrementBetCommand } from '@core/commands/action/IncrementDecrementBetCommand';
import { CloseBuyBonusCommand } from '@core/commands/action/CloseBuyBonusCommand';
import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { BuyBonusConfirmedCommand } from '@core/commands/action/BuyBonusConfirmedCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

export const BUY_BONUS_CONFIG = {
  name: 'buyBonusView',
  type: 'Comp',
  class: BuyBonusView,
  requiredBundle: LOAD_CONSTANTS.POPUPS,
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
      content: 'BuyFreeSpinsText',
      toUpperCase: true,
      style: { fontFamily: 'gameFont1', fontSize: 100, fill: 0xffffff },

      layoutData: {
        Desktop: {
          refComponent: 'betPanelBg',
          hAlign: 'center',
          vAlign: 'top',
          vPaddingPerc: 0.1,
          maxScale: 1,
        },
      },
    },
    {
      name: 'buyFreeSpinsValueText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      contentText: '',
      style: { fontFamily: 'gameFont1', fontSize: 120, fill: 0xd4b43d },
      layoutData: {
        Desktop: {
          refComponent: 'betPanelBg',
          posRefComponent: 'titleText1',
          hAlign: 'center',
          vAlign: 'bottomDown',
          vPaddingPerc: 0.6,
          maxScale: 1,
        },
      },
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
      style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 50 },
      x: 600,
      y: 536,
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
      x: 980,
      y: 540,
    },

    {
      name: 'closeBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBuyBonusCommand,
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
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 40 },
        toUpperCase: true,
      },
      x: 400,
      y: 680,
    },
    {
      name: 'okBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: BuyBonusConfirmedCommand,
      },
      options: {
        defaultView: 'cancelBtn_up',
        hoverView: 'cancelBtn_up',
        pressedView: 'cancelBtn_up',
        disabledView: 'cancelBtn_up',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'okBtnTxt',
        type: 'Text',
        content: 'BuyText',
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 40 },
        toUpperCase: true,
      },
      x: 800,
      y: 680,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.7, heightPerc: 0.65, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
