import { AssetBundle } from '@brand/types/types';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';

const PRELOADER: AssetBundle = {
  name: LOAD_CONSTANTS.PRELOADER,
  assets: [
    { TYPE: 'content', NAME: 'gameContent.json' },
    { TYPE: 'commoncontent', NAME: 'commonContent.json' },
    { TYPE: 'common', NAME: 'brandLogo', ASSETTYPE: 'png' },
    { TYPE: 'common', NAME: 'Mulish.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'Belwe-Condensed.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'FontsFree-Net-SFProDisplay-Black.ttf', ASSETTYPE: 'font' },
  ],
};
const COMMON: AssetBundle = {
  name: LOAD_CONSTANTS.COMMON,
  assets: [
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
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
    { TYPE: 'game', NAME: 'bg', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Joker_Charge', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'logo', ASSETTYPE: 'spine' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'reelframes', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'hat', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'mystery_front', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'mystery_back', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'bag_collect', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'belt', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'boot', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Chain_lock_sym', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'reel_sym_add', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'mask', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'small_square', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'big_square', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'line', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'total_win_panel', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'respinCounter', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'BuyBonus-0', ASSETTYPE: 'sprite' },
  ],
};
// Respin feature art only, loaded once the game is on screen. Each view builds its piece when it
// arrives, and the feature waits for it - see JCAssetsState.
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'transition', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'electr_effect', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'saber_down', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'triangle', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'multiplier_effect', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'coins', ASSETTYPE: 'spine' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
