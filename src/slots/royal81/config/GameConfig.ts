import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';
import { Point } from 'pixi.js';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { UIConfig } from '@game/config/UIConfig';

export const GAME_CONFIG = {
  gameDesktopWidth: 2424,
  gameDesktopHeight: 1300,
  gameBGColor: 0xffffff,
  globalAnimSpeed: 0.5,
  debugMode: false,
  configPath: '/',
  gamePath: '/',
  gameVersion: '0.08',
  gameId: 'royal81',
  gameName: 'Royal 81',
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
    commonFontR: 'Roboto',
    gameFont1: 'Oxanium',
  },
  bbImage: 'screen1',
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
            toUpperCase: true,
          },
        },
      },
    ],
  },
  externalHistoryAPIURL: 'https://feg-external-dev.pixentech.com/external/report/betHistory/',
};
