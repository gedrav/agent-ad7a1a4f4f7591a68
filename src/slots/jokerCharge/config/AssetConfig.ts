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
    { TYPE: 'game', NAME: 'bookosb.ttf', ASSETTYPE: 'font' },
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'R81_Logo_Spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'controlPanelPrimaryAssets', ASSETTYPE: 'sprite' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [
    { TYPE: 'game', NAME: 'splashBG', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
  ],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'common', NAME: 'loader_anim', ASSETTYPE: 'gif' },
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'bitmapFontBW.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'bg', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'logo', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'Pot_spine', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'reelFrame_spine', ASSETTYPE: 'spine' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
