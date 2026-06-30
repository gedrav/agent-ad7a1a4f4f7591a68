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
    { TYPE: 'game', NAME: 'NewRocker-Regular.ttf', ASSETTYPE: 'font' },
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'controlPanelPrimaryAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'Logo_Anim', ASSETTYPE: 'spine' },
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
    { TYPE: 'game', NAME: 'EOG_NC_BGS', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'EOG_NC_Frame', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'king_character', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Fire_ball_FX', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'explosion1', ASSETTYPE: 'spine' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
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
  ],
};
/*const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};*/

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
