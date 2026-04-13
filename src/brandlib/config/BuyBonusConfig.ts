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
  isDesktopOnly: true,
  Elements: [
    {
      name: 'buyBonusBg',
      type: 'NineSliceSprite',
      image: 'popupbg',
      nineSlice: [32, 32, 32, 32],
      lWidth: 1184,
      lHeight: 640,
      pWidth: 712,
      pHeight: 752,
      width: 712,
      height: 752,
    },
    {
      name: 'splashImage',
      type: 'Sprite',
      image: 'transRect',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: {
          refComponent: 'buyBonusBg',
          widthPerc: 0.8,
          heightPerc: 0.45,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'top',
          vPaddingPerc: 0.14,
        },
      },
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      content: 'buyFreeSpinTitle',
      style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700 },
      layoutData: {
        Desktop: {
          refComponent: 'splashImage',
          widthPerc: 0.8,
          heightPerc: 0.45,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'bottomDown',
          vPaddingPerc: 0.1,
        },
      },
    },
    {
      name: 'buyFreeSpinsValueText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      contentText: '',
      style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 700 },
      layoutData: {
        Desktop: {
          refComponent: 'titleText',
          widthPerc: 1,
          heightPerc: 1,
          maxScale: 1,
          hAlign: 'center',
          vAlign: 'bottomDown',
          vPaddingPerc: 0.5,
        },
      },
    },
    {
      name: 'cancelBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: CloseBuyBonusCommand,
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
      x: 200,
      y: 680,
    },
    {
      name: 'startBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: BuyBonusConfirmedCommand,
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
        content: 'buyBonusBtnText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 28, fontWeight: 700 },
      },
      x: 512,
      y: 680,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.3, heightPerc: 0.58, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
