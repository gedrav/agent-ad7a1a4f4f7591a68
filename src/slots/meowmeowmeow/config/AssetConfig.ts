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
    { TYPE: 'game', NAME: 'cambriab.ttf', ASSETTYPE: 'font' },
    { TYPE: 'common', NAME: 'Oswald-Bold.ttf', ASSETTYPE: 'font' },
    { TYPE: 'game', NAME: 'controlPanelPrimaryAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameLogo', ASSETTYPE: 'sprite' },
    { TYPE: 'common', NAME: 'gameBG', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'BG', ASSETTYPE: 'spine' },
  ],
};

const SPLASH: AssetBundle = {
  name: LOAD_CONSTANTS.SPLASH,
  assets: [{ TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' }],
};

const PRIMARY: AssetBundle = {
  name: LOAD_CONSTANTS.PRIMARY,
  assets: [
    { TYPE: 'common', NAME: 'loader_anim', ASSETTYPE: 'gif' },
    { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'game', NAME: 'bitmapFontBW.fnt', ASSETTYPE: 'bmpfont' },
    { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'commonLangAssets', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'gameElements0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'KittieBank', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Coin', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'AnticipationAnim', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
    { TYPE: 'lang', NAME: 'langImages', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'jpbanner', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'WheelTest', ASSETTYPE: 'png' },
  ],
};
const SECONDARY: AssetBundle = {
  name: LOAD_CONSTANTS.SECONDARY,
  assets: [
    { TYPE: 'game', NAME: 'transition0', ASSETTYPE: 'sprite' },
    { TYPE: 'game', NAME: 'WDSymbolAnim', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'SCSymbolAnim', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: '10', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'A', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'J', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'K', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Q', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'WoolenBall', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'CoinPouch', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Fan', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'Cap', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'CupPlate', ASSETTYPE: 'spine' },
    { TYPE: 'game', NAME: 'BigWin_Anim', ASSETTYPE: 'spine' },
  ],
};
const FREESPIN: AssetBundle = {
  name: LOAD_CONSTANTS.FEATURES,
  assets: [],
};

export const ASSET_CONFIG: AssetBundle[] = [PRELOADER, COMMON, SPLASH, PRIMARY, SECONDARY];
