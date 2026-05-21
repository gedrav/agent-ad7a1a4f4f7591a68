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
  gameVersion: '0.028',
  gameId: 'empireofgold',
  gameName: 'Empire of Gold',
  uiConfig: UIConfig,
  gameAssetVersion: '0.01',
  creditValue: 20,
  anteBetMultiplier: 1.25,
  totalLines: 1,
  isConsoleActive: true,
  unloadAssets: ['splashAssets'],
  FontFaces: {
    commonFont: 'Mulish',
    commonFontBold: 'Oswald Bold',
    gameFont1: 'NewRocker Regular',
    bitmapFont: 'bitmapFont',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen2',
  bigWinValues1: [25, 50, 100, 500],
  bigWinValues: [2, 5, 10, 25],
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
            defaultView: 'ante_frame_gold',
            hoverView: 'ante_frame_gold',
            pressedView: 'ante_frame_gold',
            disabledView: 'ante_frame_gold',
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
