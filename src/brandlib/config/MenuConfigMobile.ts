import { HomeClickedCommand } from '@core/commands/action/HomeClickedCommand';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { Point } from 'pixi.js';
import { ShowGameRulesCommand } from '@core/commands/action/ShowGameRulesCommand';
import { ShowHistoryCommand } from '@core/commands/action/ShowHistoryCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { MenuCompMobile } from '@brand/views/comps/MenuCompMobile';
import { SoundStateChangeCommand } from '@core/commands/action/SoundStateChangeCommand';
import { TransactionHistoryCommand } from '@core/commands/action/TransactionHistoryCommand';
import { ShowDespoitCommand } from '@core/commands/action/ShowDepositCommand';
import { ShowPromotionCommand } from '@core/commands/action/ShowPromotionCommand';
import { MenuButton } from '@brand/views/comps/MenuButton';

export const MENU_CONFIG_MOBILE: any = {
  name: 'menuComp',
  type: 'Comp',
  isMobileOnly: true,
  class: MenuCompMobile,
  Elements: [
    {
      name: 'menubg',
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
      content: 'menuText',
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
        defaultView: 'closeBtn',
        hoverView: 'closeBtn',
        pressedView: 'closeBtn',
        disabledView: 'closeBtn',
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
          heightPerc: 0.6,
          hAlign: 'right',
          hPaddingPerc: -0.03,
          vAlign: 'middle',
        },
      },
    },
    {
      name: 'homeBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        action: {
          press: HomeClickedCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'homeIcon',
      textConfig: {
        name: 'btnText',
        type: 'Text',
        content: 'lobbyText',
        anchor: { x: 0, y: 0 },
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'soundOnBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        data: false,
        action: {
          press: SoundStateChangeCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          nineSliceSprite: [12, 12, 12, 12],
          animations: CoreUIConfig.noScalebuttonStates,
        },
      },
      icon: 'soundOnIcon',
      textConfig: {
        name: 'btnText',
        type: 'Text',
        anchor: { x: 0, y: 0 },
        content: 'soundOnOffText',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'soundOffBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        data: true,
        action: {
          press: SoundStateChangeCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'soundOffIcon',
      textConfig: {
        name: 'homeText',
        type: 'Text',
        content: 'soundOnOffText',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'transactionHistoryBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        action: {
          press: TransactionHistoryCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'transactionHistoryIcon',
      textConfig: {
        name: 'homeText',
        type: 'Text',
        content: 'transactionHistoryText',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'infoBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        action: {
          press: ShowGameRulesCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'infoIcon',
      textConfig: {
        name: 'homeText',
        type: 'Text',
        content: 'gameRulesText',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'gameHistoryBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        action: {
          press: ShowHistoryCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'gameHistoryIcon',
      textConfig: {
        name: 'homeText',
        type: 'Text',
        content: 'gameHistory',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'depositBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        action: {
          press: ShowDespoitCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'depositIcon',
      textConfig: {
        name: 'homeText',
        type: 'Text',
        content: 'depositText',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'promotionBtn',
      type: 'Comp',
      class: MenuButton,
      btnConfig: {
        action: {
          press: ShowPromotionCommand,
        },
        options: {
          defaultView: 'transRect',
          hoverView: 'transRect',
          pressedView: 'transRect',
          disabledView: 'transRect',
          animations: CoreUIConfig.noScalebuttonStates,
          nineSliceSprite: [12, 12, 12, 12],
        },
      },
      icon: 'promotionIcon',
      textConfig: {
        name: 'homeText',
        type: 'Text',
        content: 'promotionText',
        style: {
          fontFamily: 'commonFont',
          fontSize: 32,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
  ],
};
