import { AssetBundle } from '@brand/types/types';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

const PRELOADER: AssetBundle = {
  name: LOAD_CONSTANTS.PRELOADER,
  assets: [
    { TYPE: 'content', NAME: 'gameContent.json' },
    { TYPE: 'commoncontent', NAME: 'commonContent.json' },
    { TYPE: 'common', NAME: 'brandLogo', ASSETTYPE: 'png' },
    { TYPE: 'common', NAME: 'Mulish.ttf', ASSETTYPE: 'font' },
  ],
};
const COMMON: AssetBundle = {
  name: LOAD_CONSTANTS.COMMON,
  assets: [
    { TYPE: 'game', NAME: 'Caudex.ttf', ASSETTYPE: 'font' },
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'controlPanelPrimaryAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [
    { TYPE: 'game', NAME: 'splashBG', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
  ],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    // jackpot assets start
    { TYPE: 'common', NAME: 'jakpots', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'cards', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'jp_jackpots', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'jp_wins', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'jackpotBG', ASSETTYPE: 'sequence', file: [1, 1] },
    { TYPE: 'common', NAME: 'bitmapFontJP.fnt', ASSETTYPE: 'bmpfont' },
    // jackpot assets end

    { TYPE: 'common', NAME: 'loader_anim', ASSETTYPE: 'gif' },
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'bitmapFontBW.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'BG', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'Transition', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'book_feature', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'bigWins', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbol_A', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'wild', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Castle', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'eagle', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbol_J', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbol_K', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'cup', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbol_Q', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'wolf', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'scatter2', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'scatter1', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'book_win_frame', ASSETTYPE: 'spine' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
