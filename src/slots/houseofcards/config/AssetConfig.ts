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
    { TYPE: 'game', NAME: 'Mencken-Std-Narrow-Extra-Bold.otf', ASSETTYPE: 'font' },
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
    { TYPE: 'game', NAME: 'gamebg', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'jackpot', ASSETTYPE: 'spine', spineImageType: 'webp' },
    // { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
    // { TYPE: 'game', NAME: 'reelFrame', ASSETTYPE: 'spine' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'king', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'Queen', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'prince', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'crown', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'Wild', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'A_Symbol', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'K_Symbol', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'Q_Symbol', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: 'J_Symbol', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: '10_Symbol', ASSETTYPE: 'spine', spineImageType: 'webp' },
    { TYPE: 'game', NAME: '9_Symbol', ASSETTYPE: 'spine', spineImageType: 'webp' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
