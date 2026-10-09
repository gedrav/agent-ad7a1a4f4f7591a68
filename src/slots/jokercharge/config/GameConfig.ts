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
    gameFont1: 'FontsFree-Net-SFProDisplay-Black.ttf',
    belweCondensed: 'Belwe-Condensed.ttf',
    sfProDisplayBlack: 'FontsFree-Net-SFProDisplay-Black.ttf',
  },
  LANGUAGES_SUPPORTED: ['en', 'cs', 'sk', 'ro', 'hr', 'cnr', 'pl', 'lt'],
  bbImage: 'screen1',
  getExtraSpinData: () => ({ activePaylines: getSelectedLines() }),
  bigWinValues: [25, 50, 100, 500],
};
