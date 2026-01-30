const PRELOADER: Array<any> = [
  { TYPE: 'commonConfig', NAME: 'commonConfig.json' },
  { TYPE: 'content', NAME: 'gameContent.json' },
  { TYPE: 'content', NAME: 'rules.json' },
  { TYPE: 'commoncontent', NAME: 'commonContent.json' },
  { TYPE: 'common', NAME: 'brandLogo', ASSETTYPE: 'png' },
  { TYPE: 'common', NAME: 'Roboto-Regular.ttf', ASSETTYPE: 'font' },
];
const COMMON: any[] = [
  { TYPE: 'common', NAME: 'Roboto-Bold.ttf', ASSETTYPE: 'font' },
  { TYPE: 'game', NAME: 'GermaniaOne-Regular.ttf', ASSETTYPE: 'font' },
];
const SPLASH: any[] = [
  { TYPE: 'game', NAME: 'bg_day', ASSETTYPE: 'spine' },
  { TYPE: 'game', NAME: 'splashAssets', ASSETTYPE: 'sprite' },
];

const PRIMARY: any[] = [
  { TYPE: 'game', NAME: 'bg_night', ASSETTYPE: 'spine' },
  { TYPE: 'game', NAME: 'bitmapFont.fnt', ASSETTYPE: 'bmpfont' },
  { TYPE: 'common', NAME: 'controlPanelAssets', ASSETTYPE: 'sprite' },
  { TYPE: 'common', NAME: 'popups', ASSETTYPE: 'sprite' },
  { TYPE: 'game', NAME: 'gameElements', ASSETTYPE: 'sprite' },
  { TYPE: 'game', NAME: 'symbols', ASSETTYPE: 'sprite' },
  { TYPE: 'game', NAME: 'Lepg_Wins', ASSETTYPE: 'spine' },
];

const SECONDARY: any = [];
const FEATURE: any = [];

export const ASSET_CONFIG = {
  PRELOADER: PRELOADER,
  COMMON: COMMON,
  SPLASH: SPLASH,
  PRIMARY: PRIMARY,
  BUNDLES: {
    SECONDARY: SECONDARY,
    FEATURE: FEATURE,
  },
};
