import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { SoundFactory } from '@core/sound/SoundServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { ContentProxy } from '@core/models/ContentServiceProxy';

declare const __GAME_ID__: string;
const GAME_PATH_PREFIX = `/src/slots/${__GAME_ID__}/`;

declare global {
  interface Window {
    getHistoryPageURL: () => string;
    getMaxPayout: () => string;
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
  }
}

export class WindowUtil {
  initWindowFunctions() {
    const getData = () => appModel.getGameInitData();
    window.getHistoryPageURL = () => GameProxy.config?.historyURL;
    window.formatCurrency = (value) => Util.formatCurrency(value);
    window.getBalance = () => appModel.getBalance();
    window.getToken = () => appModel.getToken();
    window.getExternalHistoryURL = () => GameProxy.config?.externalHistoryAPIURL;
    window.getHistoryURL = () => GameProxy.config?.historyAPIURL;
    window.getSpecificContent = (str) => Util.getContent(str);
    window.setCheatValue = (cheat) => {
      GameProxy.config.cheatObject = cheat;
    };
    window.getMaxPayout = () => Util.formatCurrency(getData()?.playerInfo?.maxPayout);
    window.getMaxBBPayout = () => Util.formatCurrency(getData()?.playerInfo?.bbMaxWin);
    window.getGameInitData = getData;
    window.getGameVersion = () => getData()?.version;
    window.getIsSoundOn = () => {
      return SoundFactory.sfxState;
    };
    window.playHistoryRulesSound = function () {
      if (window.getIsSoundOn()) {
        EventHandler.dispatchEvent(SlotEvents.PLAY_HISTORY_AND_RULES_BTN_SOUND);
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
      return appModel.getTotalBet() / (GameProxy.config.totalLines * GameProxy.config.creditValue);
    };
    window.getGameConfig = () => GameProxy.config;
    window.stopPixiApp = () => {};
    window.startPixiApp = () => {};
  }
}
