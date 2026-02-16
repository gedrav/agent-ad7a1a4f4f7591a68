import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';
import { Point } from 'pixi.js';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { UIConfig } from '@game/config/UIConfig';

export const GAME_CONFIG = {
  gameHDWidth: 1284,
  gameHDHeight: 2200,
  gameDesktopWidth: 1080,
  gameDesktopHeight: 1920,
  gameBGColor: 0x000000,
  globalAnimSpeed: 0.5,
  debugMode: false,
  configPath: '/',
  gamePath: '/',
  gameVersion: '0.05',
  gameId: 'royal81',
  sendTotalBetInRequest: true,
  gameName: 'Royal 81',
  uiConfig: UIConfig,
  gameAssetVersion: '0.01',
  creditValue: 20,
  totalLines: 1,
  isConsoleActive: true,
  unloadAssets: ['splashAssets'],
  FontFaces: {
    commonFont: 'Roboto Regular',
    commonFontBold: 'Roboto Bold',
    gameFont1: 'Wakerobin Bold',
  },
  bigWinValues: [5, 25, 50, 100],
  buyBonusData: {
    features: [
      {
        btn: {
          name: 'bbBtn1',
          type: 'Button',
          action: {
            press: BuyBonusClickCommand,
          },
          data: { id: 'FG1' },
          options: {
            defaultView: 'buybonusBtn_up',
            hoverView: 'buybonusBtn_up',
            pressedView: 'buybonusBtn_up',
            disabledView: 'buybonusBtn_up',
            textOffset: new Point(0, 2),
            animations: CoreUIConfig.spinButtonStates,
          },
          textConfig: {
            name: 'bbBtn',
            type: 'Text',
            content: 'BuyText',
            style: {
              fontFamily: 'gameFont1',
              fill: 0xffffff,
              fontSize: 180,
              lineHeight: 88,
              wordWrap: true,
              wordWrapWidth: 200,
              align: 'center',
              dropShadow: true,
              dropShadowColor: 0x000000,
              dropShadowBlur: 0x000000,
              dropShadowDistance: 20,
              stroke: 0x000000,
              strokeThickness: 20,
            },
            toUpperCase: true,
          },
        },
      },
    ],
  },
};
