import { CoreUIConfig } from './CoreUIConfig';
import { CloseBuyBonusCommand } from '@core/commands/action/CloseBuyBonusCommand';
import { BuyBonusConfirmedCommand } from '@core/commands/action/BuyBonusConfirmedCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { BuyBonusViewMobile } from '@brand/views/popups/BuyBonusViewMobile';

export const BUY_BONUS_CONFIG_MOBILE = {
  name: 'buyBonusView',
  type: 'Comp',
  isMobileOnly: true,
  class: BuyBonusViewMobile,
  Elements: [
    {
      name: 'buyBonusBg',
      type: 'Graphics',
      width: 600,
      height: 840,
      radius: 32,
      color: 0x000000,
      layoutData: {
        Portrait: { fitToScreen: true },
        Landscape: { fitToScreen: true },
      },
    },
    {
      name: 'topbar',
      type: 'Graphics',
      width: 600,
      height: 40,
      color: 0x454c5d,
      layoutData: {
        Portrait: { widthPercForce: 1 },
        Landscape: { widthPercForce: 1 },
      },
    },
    {
      name: 'titleText',
      type: 'Text',
      content: 'buyBonusBtnText',
      anchor: { x: 0, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 18, fill: 0xffffff, fontWeight: 700 },
      layoutData: {
        Portrait: {
          refComponent: 'topbar',
          maxScale: 1,
          widthPerc: 0.4,
          heightPerc: 0.7,
          hAlign: 'left',
          hPaddingPerc: 0.03,
          vAlign: 'middle',
        },
        Landscape: {
          refComponent: 'topbar',
          maxScale: 1,
          widthPerc: 0.4,
          heightPerc: 0.7,
          hAlign: 'left',
          hPaddingPerc: 0.02,
          vAlign: 'middle',
        },
      },
    },
    {
      name: 'closeBtn',
      type: 'Button',
      options: {
        defaultView: 'closeIconBtn',
        hoverView: 'closeIconBtn',
        pressedView: 'closeIconBtn',
        disabledView: 'closeIconBtn',
        animations: CoreUIConfig.noScalebuttonStates,
      },
      layoutData: {
        Portrait: {
          refComponent: 'topbar',
          maxScale: 1,
          widthPerc: 0.4,
          heightPerc: 1,
          hAlign: 'right',
          hPaddingPerc: -0.03,
          vAlign: 'middle',
        },
        Landscape: {
          refComponent: 'topbar',
          maxScale: 1,
          widthPerc: 0.4,
          heightPerc: 1,
          hAlign: 'right',
          hPaddingPerc: -0.03,
          vAlign: 'middle',
        },
      },
    },
    {
      name: 'elementsContainer',
      type: 'Container',
      Elements: [
        {
          name: 'titleText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          content: 'buyFreeSpinTitle',
          style: { fontFamily: 'commonFont', fontSize: 50, fill: 0xffffff, fontWeight: 700 },
          x: 712,
          y: 4,
        },
        {
          name: 'buyFreeSpinsValueText',
          type: 'Text',
          anchor: { x: 0.5, y: 0.5 },
          contentText: '',
          style: { fontFamily: 'commonFont', fontSize: 50, fill: 0xffffff, fontWeight: 700 },
          x: 712,
          y: 1400,
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
            defaultView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x484c5b }),
            hoverView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x484c5b }),
            pressedView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x484c5b }),
            disabledView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0x484c5b }),
            animations: CoreUIConfig.buttonStates,
          },
          textConfig: {
            name: 'closeBtn1Text',
            type: 'Text',
            content: 'cancelText',
            style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 44, fontWeight: 700 },
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
            defaultView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xffffff }),
            hoverView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xffffff }),
            pressedView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xffffff }),
            disabledView: UIUtil.getRoundedRectangle({ width: 500, height: 130, radius: 16, color: 0xcccccc }),
            animations: CoreUIConfig.buttonStates,
          },
          textConfig: {
            name: 'closeBtn1Text',
            type: 'Text',
            content: 'buyBonusBtnText',
            style: { fontFamily: 'commonFont', fill: 0x000000, fontSize: 44, fontWeight: 700 },
          },
        },
      ],
    },
  ],
};
