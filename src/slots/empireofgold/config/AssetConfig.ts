import { AssetBundle } from '@brand/types/types';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

const PRELOADER: AssetBundle = {
  name: LOAD_CONSTANTS.PRELOADER,
  assets: [
    { TYPE: 'commonConfig', NAME: 'commonConfig.json' },
    { TYPE: 'content', NAME: 'gameContent.json' },
    // { TYPE: 'content', NAME: 'rules.json' },
    { TYPE: 'commoncontent', NAME: 'commonContent.json' },
    { TYPE: 'common', NAME: 'brandLogo', ASSETTYPE: 'png' },
    { TYPE: 'common', NAME: 'Mulish.ttf', ASSETTYPE: 'font' },
  ],
};
const COMMON: AssetBundle = {
  name: LOAD_CONSTANTS.COMMON,
  assets: [
    { TYPE: 'game', NAME: 'NewRocker-Regular.ttf', ASSETTYPE: 'font' },
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [
    { TYPE: 'game', NAME: 'splashBG', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'controlPanelPrimaryAssets', ASSETTYPE: 'sprite' },
  ],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'BG_king', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'reels_frame', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'character', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'explosion1', ASSETTYPE: 'spine' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'text', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'bigwins', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'scatter', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'chest', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'book', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'shield', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'cup', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'low_1', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'low_2', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'low_3', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'low_4', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'low_5', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'multiplayer', ASSETTYPE: 'spine' },
  ],
};
/*const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};*/

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
