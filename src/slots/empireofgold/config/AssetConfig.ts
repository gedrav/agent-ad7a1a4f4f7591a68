import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { AssetBundle } from '@brand/types/types';

const PRELOADER: AssetBundle = {
  name: LOAD_CONSTANTS.PRELOADER,
  assets: [
    { TYPE: 'commonConfig', NAME: 'commonConfig.json' },
    { TYPE: 'content', NAME: 'gameContent.json' },
    { TYPE: 'content', NAME: 'rules.json' },
    { TYPE: 'commoncontent', NAME: 'commonContent.json' },
    { TYPE: 'common', NAME: 'brandLogo', ASSETTYPE: 'png' },
    { TYPE: 'common', NAME: 'Roboto-Regular.ttf', ASSETTYPE: 'font' },
  ],
};

const COMMON: AssetBundle = {
  name: LOAD_CONSTANTS.COMMON,
  assets: [
    { TYPE: 'common', NAME: 'Roboto-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'GermaniaOne-Regular.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'bg_day', ASSETTYPE: 'spine' },
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
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'popups1', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'popups2', ASSETTYPE: 'sprite' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [{ TYPE: 'game', NAME: 'Lepg_Wins', ASSETTYPE: 'spine' }],
};
const FEATURES: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [
    { TYPE: 'game', NAME: 'bg_night', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'freespinAssets', ASSETTYPE: 'sprite' },
  ],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY, FEATURES];
export const PRIMARY_ASSET_LENGTH: number = 4;
