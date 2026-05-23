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
  gameVersion: '0.010',
  gameId: 'frostedmarketbonanza',
  gameName: 'Frosted Market Bonanza',
  uiConfig: UIConfig,
  creditValue: 20,
  anteBetMultiplier: 1.25,
  totalLines: 1,
  isConsoleActive: true,
  unloadAssets: ['splashAssets'],
  FontFaces: {
    commonFont: 'Mulish',
    commonFontBold: 'Oswald Bold',
    gameFont1: 'Lobster Regular',
    bitmapFont: 'bitmapFont',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen2',
  bigWinValues: [25, 50, 100, 500],
};
