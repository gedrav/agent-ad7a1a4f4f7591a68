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
    { TYPE: 'game', NAME: 'vincendo.ttf', ASSETTYPE: 'font' },
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
    { TYPE: 'game', NAME: 'bitmapFontBW.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'gameBg', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'goldcards', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },

    { TYPE: 'game', NAME: 'lowpayingsymbols', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'H1', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'H2', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'H3', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'wild', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'gems', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'GoldCard', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'MD_FeaturePopUP', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'Minecart', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'MinecartGoldCard', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'bigWins', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'particle_spine', ASSETTYPE: 'spine', spineImageType: 'webp' },
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
