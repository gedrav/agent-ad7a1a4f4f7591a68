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
    { TYPE: 'common', NAME: 'loader_anim', ASSETTYPE: 'gif' },
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'Cannon_spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'BG', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'reel', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'nudge_feature', ASSETTYPE: 'spine' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'winpanel', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'wins', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'scatter', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'cupcake', ASSETTYPE: 'spine' }, //H1
    { TYPE: 'game', NAME: 'cookies', ASSETTYPE: 'spine' }, //H2
    { TYPE: 'game', NAME: 'pie', ASSETTYPE: 'spine' }, //H3
    { TYPE: 'game', NAME: 'cake', ASSETTYPE: 'spine' }, //H4
    { TYPE: 'game', NAME: 'low_green', ASSETTYPE: 'spine' }, //L1
    { TYPE: 'game', NAME: 'low_red', ASSETTYPE: 'spine' }, //L2
    { TYPE: 'game', NAME: 'low_yellow', ASSETTYPE: 'spine' }, //L3
    { TYPE: 'game', NAME: 'low_spin', ASSETTYPE: 'spine' }, //L4
    { TYPE: 'game', NAME: 'low_candy', ASSETTYPE: 'spine' }, //L5
  ],
};
/*const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};*/

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
