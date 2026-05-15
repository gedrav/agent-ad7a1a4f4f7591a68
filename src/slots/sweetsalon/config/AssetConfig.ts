import { AssetBundle } from '@brand/types/types';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

const PRELOADER: AssetBundle = {
  name: LOAD_CONSTANTS.PRELOADER,
  assets: [
    { TYPE: 'commonConfig', NAME: 'commonConfig.json' },
    { TYPE: 'content', NAME: 'gameContent.json' },
    { TYPE: 'commoncontent', NAME: 'commonContent.json' },
    { TYPE: 'common', NAME: 'brandLogo', ASSETTYPE: 'png' },
    { TYPE: 'common', NAME: 'Mulish.ttf', ASSETTYPE: 'font' },
  ],
};
const COMMON: AssetBundle = {
  name: LOAD_CONSTANTS.COMMON,
  assets: [
    { TYPE: 'game', NAME: 'Lobster-Regular.ttf', ASSETTYPE: 'font' },
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
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'BG', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'explosion1', ASSETTYPE: 'spine' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'panel', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'text', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'wins', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'scatter', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'red_cake', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'purple_cake', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'muffin', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'green_cake', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'plum', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'berry', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'grape', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'lemon', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'strawberry', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Candy_multiplier', ASSETTYPE: 'spine' },
  ],
};
/*const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};*/

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
