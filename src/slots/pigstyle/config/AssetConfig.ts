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
    { TYPE: 'game', NAME: 'Super Foods.ttf', ASSETTYPE: 'font' },
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'controlPanelPrimaryAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [{ TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' }],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'common', NAME: 'loader_anim', ASSETTYPE: 'gif' },
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'bitmapFontBW.fnt', ASSETTYPE: 'bmpfont' },
    // game bgs
    { TYPE: 'game', NAME: 'gamebg', ASSETTYPE: 'sequence', file: [2, 2] },
    { TYPE: 'game', NAME: 'BG', ASSETTYPE: 'spine' },

    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sequence', file: [2, 1] },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sequence', file: [3, 1] },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'reelFrame', ASSETTYPE: 'spine' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    // symbol animations
    { TYPE: 'game', NAME: 'wild', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'bonus', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'pigs', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'boots', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'corn', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'low_symbols', ASSETTYPE: 'spine' },
    // wild animations
    { TYPE: 'game', NAME: 'wild_x2_x3', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'wildStickyAnim', ASSETTYPE: 'sequence', file: [3, 1] },
    // bigwin
    { TYPE: 'game', NAME: 'big_wins', ASSETTYPE: 'spine' },
    // popup
    { TYPE: 'game', NAME: 'popup_free_spins', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'popup', ASSETTYPE: 'spine' },
    // transition
    { TYPE: 'game', NAME: 'transition_horisontal', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'transition_vertical', ASSETTYPE: 'spine' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
