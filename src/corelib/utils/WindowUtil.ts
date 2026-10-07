import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { ContentProxy } from '@core/models/ContentServiceProxy';
import { AssetLoader } from '@core/models/services/AssetLoader';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';

declare const __GAME_ID__: string;
const GAME_PATH_PREFIX = `/src/slots/${__GAME_ID__}/`;
let historyRulesAudio: HTMLAudioElement | null = null;

function getHistoryRulesAudio(): HTMLAudioElement | null {
  if (!historyRulesAudio) {
    const soundPath = AssetLoader.getHistoryRulesSoundPath();
    if (!soundPath) return null;
    historyRulesAudio = new Audio(soundPath);
    historyRulesAudio.preload = 'auto';
  }

  return historyRulesAudio;
}

declare global {
  interface Window {
    getHistoryPageURL: () => string;
    getMaxPayout: () => string;
    getMinBet: () => string;
    getMaxBet: () => string;
    getBBMaxBet: () => string;
    getMaxBBPayout: () => string;
    getGameInitData: () => any;
    getGameVersion: () => string;
    getToken: () => string;
    getExternalHistoryURL: () => string;
    getHistoryURL: () => string;
    getBalance: () => number;
    getSpecificContent: (str: string) => string;
    setCheatValue: (cheat: any) => void;
    formatCurrency: (value: number) => string;
    getIsSoundOn: () => boolean;
    playHistoryRulesSound: () => void;
    getCommonRulePath: () => string;
    getRulesPath: () => string;
    getGameLang: () => string;
    getCommonAssetPath: () => string;
    getGameRulesPath: () => string;
    getCommonHistoryPath: () => string;
    getCheatPath: () => string;
    setExternalPageClosed: () => void;
    getPaytableSymbols: () => string[];
    getTotalCredit: () => number;
    getGameConfig: () => any;
    getAllContent: () => any;
    stopPixiApp: () => void;
    startPixiApp: () => void;
    getRtpValue: () => number;
    getMaxExposure: () => number;
    getCachedGameContent: () => any;
    getCachedCommonContent: () => any;
    getBBRtp: () => any;
    isFunMode: () => boolean;
    postActivityEvent: (eventName: string, parameters?: any) => void;
  }
}

export class WindowUtil {
  initWindowFunctions() {
    const getData = () => appModel.getGameInitData();
    window.getHistoryPageURL = () => GameProxy.config?.historyURL;
    window.formatCurrency = (value) => Util.formatCurrency(value);
    window.getBalance = () => appModel.getBalance();
    window.getToken = () => appModel.getToken();
    window.getExternalHistoryURL = () => GameProxy.config?.externalHistoryURL;
    window.getHistoryURL = () => GameProxy.config?.historyAPIURL;
    window.getSpecificContent = (str) => Util.getContent(str);
    window.setCheatValue = (cheat) => {
      GameProxy.config.cheatObject = cheat;
    };
    window.getMaxPayout = () => Util.formatCurrency(getData()?.playerInfo?.maxPayout);
    window.getMaxBBPayout = () => Util.formatCurrency(getData()?.playerInfo?.bbMaxWin);
    window.getMinBet = () => Util.formatCurrency(appModel.getMinBet());
    window.getMaxBet = () => Util.formatCurrency(appModel.getMaxBet());
    window.getBBMaxBet = () => Util.formatCurrency(appModel.getBBMaxBet());
    window.getGameInitData = getData;
    window.getGameVersion = () => import.meta.env.VITE_GAME_VERSION + '_' + GameProxy.config.gameVersion;
    window.getIsSoundOn = () => {
      return SoundFactory.sfxState;
    };
    window.playHistoryRulesSound = function () {
      if (window.getIsSoundOn()) {
        const audio = getHistoryRulesAudio();
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        void audio.play().catch((err) => {
          console.warn('[WindowUtil] Failed to play history/rules sound', err);
        });
      }
    };
    window.getCommonRulePath = () => `assets/locale/${appModel.language}/`;
    window.getGameLang = () => appModel.language || 'en';
    window.getCommonAssetPath = () => 'assets/';
    window.getGameRulesPath = () => `assets/panel/gamerules.html`;
    window.getCommonHistoryPath = () => 'assets/history/historyV2.html';
    window.getCheatPath = () => `assets/panel/cheat.json`;

    window.setExternalPageClosed = () => (GameProxy.config.exterPageOpened = false);
    window.getPaytableSymbols = () => {
      const gameData = window.getGameInitData();
      const paytable = gameData?.gameInfo?.payTable;

      if (!paytable) return [];

      return Object.keys(paytable).filter((key) => {
        if (key === 'SC' || key === 'WD') {
          const symbolData = paytable[key];
          return symbolData && Object.values(symbolData).some((value) => Number(value) > 0);
        }
        return true;
      });
    };
    window.getTotalCredit = function () {
      return appModel.getTotalBetForPaytable() / (GameProxy.config.totalLines * GameProxy.config.creditValue);
    };
    window.getGameConfig = () => GameProxy.config;
    window.stopPixiApp = () => {};
    window.startPixiApp = () => {};
    window.getRtpValue = () => appModel.getRTP();
    window.getMaxExposure = () => appModel.maxExposure();
    window.getCachedGameContent = () => ContentProxy.content;
    window.getCachedCommonContent = () => ContentProxy.content;
    window.getBBRtp = () => appModel.getBBRTP();
    window.isFunMode = () => appModel.funMode;
    window.postActivityEvent = (eventName, parameters = {}) => WrapperProxy.postActivityEvent(eventName, parameters);
  }
}
