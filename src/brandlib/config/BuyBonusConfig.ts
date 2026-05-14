import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { IncrementDecrementBetCommand } from '@core/commands/action/IncrementDecrementBetCommand';
import { CloseBuyBonusCommand } from '@core/commands/action/CloseBuyBonusCommand';
import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { BuyBonusConfirmedCommand } from '@core/commands/action/BuyBonusConfirmedCommand';
import { IncrementDecrementActionBetCommand } from '@core/commands/action/IncrementDecrementActionBetCommand';

export const BUY_BONUS_CONFIG = {
  name: 'buyBonusView',
  type: 'Comp',
  class: BuyBonusView,
  Elements: [
    {
      name: 'buyBonusBg',
      type: 'NineSliceSprite',
      image: 'popupbg',
      nineSlice: [32, 32, 32, 32],
      width: 712,
      height: 650,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      content: 'buyFeatureTitle',
      style: { fontFamily: 'commonFont', fontSize: 44, fill: 0xffffff, fontWeight: 700 },
      x: 356,
      y: 60,
    },
    {
      name: 'buyValueText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      content: 'buyValueText',
      style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 700 },
      x: 356,
      y: 160,
    },
    {
      name: 'buyFreeSpinsValueText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      contentText: '',
      style: { fontFamily: 'commonFont', fontSize: 50, fill: 0xffffff, fontWeight: 700 },
      x: 356,
      y: 230,
    },
    {
      name: 'baseBetText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      content: 'baseBetText',
      style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 700 },
      x: 356,
      y: 350,
    },
    {
      name: 'stakeContainer',
      type: 'Container',
      x: 74,
      y: 390,
      Elements: [
        { name: 'stakebg', type: 'Sprite', image: 'inputBG', x: 0, y: 0 },
        {
          name: 'stakeText',
          type: 'Text',
          contentText: '',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 40, fontWeight: 700 },
          x: 279,
          y: 36,
        },
        {
          name: 'downStakeBtn',
          type: 'Button',
          scale: 1,
          data: -1,
          soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
          action: {
            press: IncrementDecrementActionBetCommand,
          },
          options: {
            defaultView: 'minusBtn',
            hoverView: 'minusBtn',
            pressedView: 'minusBtn',
            disabledView: 'minusBtnInactive',
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
          soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
          action: {
            press: IncrementDecrementActionBetCommand,
          },
          options: {
            defaultView: 'plusBtn',
            hoverView: 'plusBtn',
            pressedView: 'plusBtn',
            disabledView: 'plusBtnInactive',
            animations: CoreUIConfig.buttonStates,
          },
          x: 500,
          y: 40,
        },
      ],
    },
    {
      name: 'cancelBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBuyBonusCommand,
      },
      soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
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
      x: 200,
      y: 570,
    },
    {
      name: 'startBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: BuyBonusConfirmedCommand,
      },
      soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
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
        content: 'buyBonusBtnText',
        style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 28, fontWeight: 700 },
      },
      x: 512,
      y: 570,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.3, heightPerc: 0.58, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
