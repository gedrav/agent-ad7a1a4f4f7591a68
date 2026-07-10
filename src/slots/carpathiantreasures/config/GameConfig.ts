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
  gameVersion: '0.092',
  gameId: 'bookofstorms',
  gameName: 'Carpathian Treasures',
  uiConfig: UIConfig,
  creditValue: 1,
  totalLines: 9,
  anteBetMultiplier: 1.25,
  unloadAssets: ['splashAssets'],
  showWinInReelView: true,
  dontShowAllWinForFeature: true,
  featureTriggerDelay: 3500,
  dontShowWinAfterFS: true,
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
};
