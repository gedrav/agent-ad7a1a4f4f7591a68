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
  gameVersion: '0.079',
  gameId: 'meowmeowmeow',
  gameName: 'Meow Meow Meow',
  subFeatureAwardAnnounced: false,
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
    gameFont1: 'ClarendonCondensedBold',
    commonFontBold: 'Oswald Bold',
    bitmapFont: 'bitmapFont',
    bitmapFontBW: 'bitmapFontBW',
    gameFont2: 'showg',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen1',
  bigWinValues: [50, 100, 200, 300],
  reelSpinSettings: {
    firstReelSymbolPassCount: 5,
    otherReelsSymbolPassCount: 1,
    anticipationSymbolPassCount: 30,
    endJerkDistance: 200,
  },
};
