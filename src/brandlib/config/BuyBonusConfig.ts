import { ChangeTotalBetCommand } from '@core/commands/action/ChangeTotalBetCommand';
import { CoreUIConfig } from './CoreUIConfig';
import { IncrementDecrementBetCommand } from '@core/commands/action/IncrementDecrementBetCommand';
import { CloseBuyBonusCommand } from '@core/commands/action/CloseBuyBonusCommand';
import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { BuyBonusConfirmedCommand } from '@core/commands/action/BuyBonusConfirmedCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { GameProxy } from '@core/models/GameConfigProxy';

export const BUY_BONUS_CONFIG = {
  name: 'buyBonusView',
  type: 'Comp',
  class: BuyBonusView,
  isDesktopOnly: true,
  Elements: [
    {
      name: 'buyBonusBg',
      type: 'ResponsiveGraphics',
      width: 780,
      height: 836,
      radius: 32,
      color: 0x000000,
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
        defaultView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0x000000 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0x000000 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0x000000 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0xcccccc }),
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtn1Text',
        type: 'Text',
        content: 'cancelText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 32, fontWeight: 700 },
      },
      layoutData: {
        Desktop: {
          refComponent: 'buyBonusBg',
          widthPerc: 0.3,
          heightPerc: 1,
          maxScale: 1,
          hAlign: 'center',
          hPaddingPerc: -0.15,
          vAlign: 'bottom',
          vPaddingPerc: -0.1,
        },
      },
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
        defaultView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0xffffff }),
        hoverView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0xffffff }),
        pressedView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0xffffff }),
        disabledView: UIUtil.getRoundedRectangle({ width: 284, height: 88, radius: 12, color: 0xffffff }),
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtn1Text',
        type: 'Text',
        content: 'buyBonusBtnText',
        style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 32, fontWeight: 700 },
      },
      layoutData: {
        Desktop: {
          refComponent: 'buyBonusBg',
          widthPerc: 0.3,
          heightPerc: 1,
          maxScale: 1,
          hAlign: 'center',
          hPaddingPerc: 0.15,
          vAlign: 'bottom',
          vPaddingPerc: -0.1,
        },
      },
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.32, heightPerc: 0.64, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
