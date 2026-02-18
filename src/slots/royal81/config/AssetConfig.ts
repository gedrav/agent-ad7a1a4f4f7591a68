import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

const PRELOADER: any = {
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
const COMMON: any = {
  name: LOAD_CONSTANTS.COMMON,
  assets: [
    { TYPE: 'common', NAME: 'Roboto-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'wakerobin-bold.otf', ASSETTYPE: 'font' },
  ],
};

const SPLASH: any = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gamebg', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
  ],
};

const PRIMARY: any = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'popups', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    //{ TYPE: 'game', NAME: 'Lepg_Wins', ASSETTYPE: 'spine' },
  ],
};

const SECONDARY: any = [];
const FEATURE: any = [];

export const ASSET_CONFIG = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
