import { BuyBonusClickCommand } from '@core/commands/action/BuyBonusClickCommand';
import { Point } from 'pixi.js';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';
import { UIConfig } from '@game/config/UIConfig';
import { getSelectedLines } from '@slots/jokercharge/models/JCLinesState';

export const GAME_CONFIG = {
  gameDesktopWidth: 2424,
  gameDesktopHeight: 1300,
  gameBGColor: 0x000000,
  globalAnimSpeed: 0.5,
  debugMode: false,
  configPath: '/',
  gamePath: '/',
  gameVersion: '0.001',
  gameId: 'jokercharge',
  gameName: 'Joker Charge',
  uiConfig: UIConfig,
  creditValue: 1,
  totalLines: 3,
  unloadAssets: ['splashAssets'],
  showWinInReelView: true,
  FontFaces: {
    commonFont: 'Mulish',
    commonFontBold: 'Oswald Bold',
    gameFont1: 'bookosb',
    bitmapFont: 'bitmapFont',
    bitmapFontBW: 'bitmapFontBW',
    // AssetLoader.loadFont() registers the FontFace using the asset NAME verbatim (extension
    // included), so this must match 'Belwe-Condensed.ttf' exactly, not just the font's own name.
    belweCondensed: 'Belwe-Condensed.ttf',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen1',
  // Read by MessageServiceProxy on every spin, buy bonus included: the backend prices the round
  // by how many lines the player is playing.
  getExtraSpinData: () => ({ activePaylines: getSelectedLines() }),
  bigWinValues: [25, 50, 100, 500],
};
