import { AssetBundle } from '@brand/types/types';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

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
    { TYPE: 'game', NAME: 'wakerobin-bold.otf', ASSETTYPE: 'font' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gamebg', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
  ],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    //{ TYPE: 'game', NAME: 'Lepg_Wins', ASSETTYPE: 'spine' },
  ],
};
const POPUPS: AssetBundle = {
  name: LOAD_CONSTANTS.POPUPS,
  assets: [
    { TYPE: 'common', NAME: 'popups1', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'popups2', ASSETTYPE: 'sprite' },
  ],
};
const SECONDARY: AssetBundle = { name: LOAD_CONSTANTS.SECONDARY, assets: [] };
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FREESPIN,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, POPUPS];
export const PRIMARY_ASSET_LENGTH: number = 4;
