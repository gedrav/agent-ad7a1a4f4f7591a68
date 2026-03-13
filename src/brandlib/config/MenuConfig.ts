import { MenuComp } from '@brand/views/comps/MenuComp';
import { HomeClickedCommand } from '@core/commands/action/HomeClickedCommand';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { Point } from 'pixi.js';
import { MenuCompAmbientSoundToggleCommand } from '@core/commands/action/MenuCompAmbientSoundToggleCommand';
import { MenuCompSfxSoundToggleCommand } from '@core/commands/action/MenuCompSfxSoundToggleCommand';
import { ShowGameRulesCommand } from '@core/commands/action/ShowGameRulesCommand';
import { ShowHistoryCommand } from '@core/commands/action/ShowHistoryCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { SoundStateChangeCommand } from '@core/commands/action/SoundStateChangeCommand';
import { TransactionHistoryCommand } from '@core/commands/action/TransactionHistoryCommand';
import { ShowInfoCommand } from '@core/commands/action/ShowInfoCommand';
import { ShowDespoitCommand } from '@core/commands/action/ShowDepositCommand';
import { ShowPromotionCommand } from '@core/commands/action/ShowPromotionCommand';

export const MENU_CONFIG: any = {
  name: 'menuComp',
  type: 'Comp',
  isDesktopOnly: true,
  class: MenuComp,
  Elements: [
    {
      name: 'menubg',
      type: 'ResponsiveGraphics',
      width: 582,
      height: 672,
      radius: 16,
      color: 0x000000,
    },
    {
      name: 'homeBtn',
      type: 'Button',
      action: {
        press: HomeClickedCommand,
      },
      x: 291,
      y: 48,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'homeIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'lobbyText',
        anchor: { x: 0, y: 0 },
        style: {
          fontFamily: 'commonFont',
          fontSize: 36,
          fill: 0xffffff,
          fontWeight: 700,
          align: 'left',
          anchor: { x: 0, y: 0 },
        },
      },
    },
    {
      name: 'soundOnBtn',
      type: 'Button',
      data: false,
      action: {
        press: SoundStateChangeCommand,
      },
      x: 291,
      y: 144,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'soundOnIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        anchor: { x: 0, y: 0 },
        content: 'soundOnOffText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
    {
      name: 'soundOffBtn',
      type: 'Button',
      data: true,
      action: {
        press: SoundStateChangeCommand,
      },
      x: 291,
      y: 144,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'soundOffIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'soundOnOffText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
    {
      name: 'transactionHistoryBtn',
      type: 'Button',
      action: {
        press: TransactionHistoryCommand,
      },
      x: 291,
      y: 240,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'transactionHistoryIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'transactionHistoryText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
    {
      name: 'infoBtn',
      type: 'Button',
      action: {
        press: ShowGameRulesCommand,
      },
      x: 291,
      y: 336,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'infoIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'gameRulesText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
    {
      name: 'gameHistoryBtn',
      type: 'Button',
      action: {
        press: ShowHistoryCommand,
      },
      x: 291,
      y: 432,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'gameHistoryIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'gameHistory',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
    {
      name: 'depositBtn',
      type: 'Button',
      action: {
        press: ShowDespoitCommand,
      },
      x: 291,
      y: 528,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'depositIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'depositText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
    {
      name: 'promotionBtn',
      type: 'Button',
      action: {
        press: ShowPromotionCommand,
      },
      x: 291,
      y: 624,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        hoverView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        pressedView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        disabledView: UIUtil.getRoundedRectangle({ width: 582, height: 96, radius: 8, color: 0x000000, alpha: 0 }),
        animations: CoreUIConfig.buttonStates,
        icon: 'promotionIcon',
        iconOffset: new Point(-236, 0),
        textOffset: new Point(-182, 0),
        defaultTextAnchor: { x: 0, y: 0.5 },
      },
      textConfig: {
        name: 'buttonText',
        type: 'Text',
        content: 'promotionText',
        style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff, fontWeight: 700, align: 'left' },
      },
    },
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.24,
      maxScale: 0.5,
      hAlign: 'right',
      vAlign: 'top',
      vPaddingPerc: 0.06,
      hPaddingPerc: -0.016,
    },
    Landscape: {
      widthPerc: 0.4,
      maxScale: 1,
      hAlign: 'left',
      vAlign: 'bottomUp',
      vPaddingPerc: -0.03,
      hPaddingPerc: 0.01,
    },
    Portrait: {
      widthPerc: 0.8,
      maxScale: 1,
      hAlign: 'left',
      vAlign: 'top',
      vPaddingPerc: 0.025,
      hPaddingPerc: 0.01,
    },
  },
};
