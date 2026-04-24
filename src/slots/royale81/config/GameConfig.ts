import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';
import { Point } from 'pixi.js';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { UIConfig } from '@game/config/UIConfig';

export const GAME_CONFIG = {
  gameDesktopWidth: 2424,
  gameDesktopHeight: 1300,
  gameBGColor: 0x000000,
  globalAnimSpeed: 0.5,
  debugMode: false,
  configPath: '/',
  gamePath: '/',
  gameVersion: '0.64',
  gameId: 'royale81',
  gameName: 'Royale 81',
  uiConfig: UIConfig,
  gameAssetVersion: '0.01',
  creditValue: 20,
  totalLines: 1,
  initURL: 'init',
  spinURL: 'spin',
  isConsoleActive: true,
  unloadAssets: ['splashAssets'],
  FontFaces: {
    commonFont: 'Mulish',
    gameFont1: 'bookosb',
    bitmapFont: 'bitmapFont',
    bitmapFontBW: 'bitmapFontBW',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen1',
  bigWinValues: [25, 50, 100, 500],
  buyBonusData1: {
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
            defaultView: 'buyBonusBtn',
            hoverView: 'buyBonusBtn',
            pressedView: 'buyBonusBtn',
            disabledView: 'buyBonusBtn',
            textOffset: new Point(0, 2),
            animations: CoreUIConfig.spinButtonStates,
          },
          textConfig: {
            name: 'bbBtn',
            type: 'Text',
            content: 'BuyText',
            style: {
              fontFamily: 'commonFont',
              fill: 0xffffff,
              fontSize: 36,
              fontWeight: 'bold',
              wordWrap: true,
              wordWrapWidth: 200,
              align: 'center',
            },
          },
        },
      },
    ],
  },
  externalHistoryAPIURL: 'https://feg-external-dev.pixentech.com/external/report/betHistory/',
};
