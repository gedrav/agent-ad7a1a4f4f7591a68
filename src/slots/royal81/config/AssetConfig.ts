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
    { TYPE: 'common', NAME: 'Roboto.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'bookosb.ttf', ASSETTYPE: 'font' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gamebg0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
  ],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'Pot_spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'R81_Logo_Spine', ASSETTYPE: 'spine' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: '777_Spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'bar_spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'bells_Spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'watermelon_Spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'plum_spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'lemon_Spine_pro', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'orange_Spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'cherry_spine_cuts', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'wild_Spine', ASSETTYPE: 'spine' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
