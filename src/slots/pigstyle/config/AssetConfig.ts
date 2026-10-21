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
  assets: [
    { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gamebg', ASSETTYPE: 'sequence', file: [2, 2] },
  ],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'common', NAME: 'loader_anim', ASSETTYPE: 'gif' },
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'bitmapFontBW.fnt', ASSETTYPE: 'bmpfont' },
    // game bgs
    { TYPE: 'game', NAME: 'BG', ASSETTYPE: 'spine', spineImageType: 'webp' },

    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sequence', file: [3, 1] },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sequence', file: [3, 1] },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'antisipation', ASSETTYPE: 'spine', spineImageType: 'webp' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    // symbol animations
    { TYPE: 'game', NAME: 'wild', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'Bonus', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'pigs', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'boots', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'corn', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'low_symbols', ASSETTYPE: 'spine', spineImageType: 'webp' },
    // wild animations
    { TYPE: 'game', NAME: 'multiplayers_wild', ASSETTYPE: 'spine', spineImageType: 'webp' },
    // bigwin
    { TYPE: 'game', NAME: 'big_wins', ASSETTYPE: 'spine', spineImageType: 'webp' },
    // popup
    { TYPE: 'game', NAME: 'popup_free_spins', ASSETTYPE: 'spine', spineImageType: 'webp' },
    // transition
    { TYPE: 'game', NAME: 'Transition', ASSETTYPE: 'spine', spineImageType: 'webp' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
