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
  gameVersion: '0.072',
  gameId: 'royale81',
  gameName: 'Royale 81',
  uiConfig: UIConfig,
  creditValue: 20,
  totalLines: 1,
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
};
