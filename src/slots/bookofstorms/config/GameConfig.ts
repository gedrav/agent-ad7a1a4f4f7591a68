import { UIConfig } from '@game/config/UIConfig';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { Point } from 'pixi.js';
import { BuyBonusButtonComp } from '@brand/views/comps/BuyBonusButtonComp';
import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';

export const GAME_CONFIG = {
  gameDesktopWidth: 2424,
  gameDesktopHeight: 1300,
  gameBGColor: 0x000000,
  globalAnimSpeed: 0.5,
  debugMode: false,
  configPath: '/',
  gamePath: '/',
  gameVersion: '0.073',
  gameId: 'bookofstorms',
  gameName: 'Book Of Storms',
  uiConfig: UIConfig,
  creditValue: 1,
  totalLines: 9,
  anteBetMultiplier: 1.25,
  isConsoleActive: true,
  unloadAssets: ['splashAssets'],
  showWinInReelView: true,
  FontFaces: {
    commonFont: 'Mulish',
    gameFont1: 'Caudex',
    commonFontBold: 'Oswald Bold',
    bitmapFont: 'bitmapFont',
    bitmapFontBW: 'bitmapFontBW',
  },
  reelSpinSettings: {
    firstReelSymbolPassCount: 5,
    otherReelsSymbolPassCount: 2,
    anticipationSymbolPassCount: 30,
    endJerkDistance: 200,
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen1',
  bigWinValues: [25, 50, 100, 500],
  buyBonusData: {
    features: [
      {
        btn: {
          name: 'bbBtn1',
          type: 'Button',
          action: {
            press: BuyBonusClickCommand,
          },
          soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
          data: { id: 'FG1' },
          options: {
            defaultView: 'bbBtn',
            hoverView: 'bbBtn',
            pressedView: 'bbBtn',
            disabledView: 'bbBtn',
            textOffset: new Point(0, 0),
            animations: CoreUIConfig.spinButtonStates,
            padding: 50,
          },
          textConfig: {
            name: 'bbBtn',
            type: 'Text',
            content: 'buyFreeSpinTitle',
            style: {
              fontFamily: 'gameFont1',
              fill: [0xffffff],
              fontSize: 80,
              fontWeight: 'bold',
              stroke: 0xfcb610,
              strokeThickness: 2,
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
};
