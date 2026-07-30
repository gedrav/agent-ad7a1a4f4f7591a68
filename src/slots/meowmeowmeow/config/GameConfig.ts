import { UIConfig } from '@game/config/UIConfig';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { Point } from 'pixi.js';
import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';

export const GAME_CONFIG = {
  gameDesktopWidth: 2424,
  gameDesktopHeight: 1300,
  gameBGColor: 0x000000,
  globalAnimSpeed: 0.5,
  debugMode: false,
  configPath: '/',
  gamePath: '/',
  gameVersion: '0.076',
  gameId: 'meowmeowmeow',
  gameName: 'Meow Meow Meow',
  uiConfig: UIConfig,
  creditValue: 10,
  totalLines: 1,
  anteBetMultiplier: 1.25,
  unloadAssets: ['splashAssets'],
  showWinInReelView: true,
  dontShowWinAfterFS: true,
  dontShowRetrigger: true,
  dontShowRetriggerDelay: 2000,
  featureTriggerDelay: 2000,
  FontFaces: {
    commonFont: 'Mulish',
    gameFont1: 'Cambria',
    commonFontBold: 'Oswald Bold',
    bitmapFont: 'bitmapFont',
    bitmapFontBW: 'bitmapFontBW',
    'Showcard Gothic': 'Showcard Gothic',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen1',
  bigWinValues: [25, 50, 100, 500],
  reelSpinSettings: {
    firstReelSymbolPassCount: 5,
    otherReelsSymbolPassCount: 1,
    anticipationSymbolPassCount: 30,
    endJerkDistance: 200,
  },
  buyBonusData1: {
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
          },
          textConfig: {
            name: 'bbBtn',
            type: 'Text',
            content: 'buyFreeSpinTitle',
            style: {
              fontFamily: 'gameFont1',
              fill: [0xffffff],
              fontSize: 60,
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
