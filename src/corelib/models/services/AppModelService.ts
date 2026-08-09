import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { CONSTANTS } from '@core/utils/CONSTANTS';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { i } from 'vite/dist/node/chunks/moduleRunnerTransport';
import { settings } from '@pixi/core';

type ParamsObject = Record<string, number>;

type ParamItem = {
  name: string;
  value: number;
};
class AppModelService {
  get promoSpinInfo(): any {
    return this._promoSpinInfo;
  }

  set promoSpinInfo(value: any) {
    this._promoSpinInfo = value;
  }
  get promoSpinSession(): boolean {
    return this._promoSpinSession;
  }

  set promoSpinSession(value: boolean) {
    this._promoSpinSession = value;
  }

  get spinStartTime(): number {
    return this._spinStartTime;
  }

  set spinStartTime(value: number) {
    this._spinStartTime = value;
  }
  get gameData(): any {
    return this._gameData;
  }

  set gameData(value: any) {
    this._gameData = value;
  }
  private _gameData: any;
  get opConfig(): any {
    return this._opConfig;
  }

  set opConfig(value: any) {
    this._opConfig = value;
  }
  private _opConfig: any;
  get waitingForFeature(): boolean {
    return this._waitingForFeature;
  }

  set waitingForFeature(value: boolean) {
    this._waitingForFeature = value;
  }
  private rtpInfo: any;
  private _waitingForFeature: boolean = false;
  get featureAssetsLoaded(): boolean {
    return this._featureAssetsLoaded;
  }

  set featureAssetsLoaded(value: boolean) {
    this._featureAssetsLoaded = value;
  }

  get secondaryAssetsLoaded(): boolean {
    return this._secondaryAssetsLoaded;
  }

  set secondaryAssetsLoaded(value: boolean) {
    this._secondaryAssetsLoaded = value;
  }
  private _primaryAssetsLoaded: boolean;
  get primaryAssetsLoaded(): boolean {
    return this._primaryAssetsLoaded;
  }
  set primaryAssetsLoaded(value: boolean) {
    this._primaryAssetsLoaded = value;
  }
  public isBundleLoaded(bundle: string): boolean {
    if (GameProxy.config.bundlesLoaded.indexOf(bundle) > -1) {
      return true;
    }
    return false;
  }
  set storeJackpotData(value: any) {
    this._storeJackpotData = value;
  }
  get storeJackpotData() {
    return this._storeJackpotData;
  }

  private _promoSpinSession: boolean;
  private _promoSpinInfo: any;
  private _spinStartTime: number;
  private unfinishedData: any;
  private featureName: string;
  private _featureResult: any;
  private _playerInfo: any;
  private _gameResult: any;
  private _language: string = 'en';
  private _currency: string = 'INR';
  private _funMode: boolean = false;
  private _gameInfo: any;
  private _fsInfo: any;
  private _turboMode: boolean = false;
  private _gameInitData: any;
  private _preferences: { sound: boolean; showIntro: boolean } = { sound: true, showIntro: false };
  private _lineWinIndex: number = 0;
  private _autoPlayObj: any;
  private _autoPlaySession: boolean = false;
  private _freeSpinsSession: boolean;
  private _pickFeatureSession: boolean = false;
  private _tumbleIndex: number;
  private _lightningStopOnBonus: boolean;
  private _secondaryAssetsLoaded: boolean;
  private _featureAssetsLoaded: boolean;
  public isSymbolExpanded: boolean = false;
  private _nextFeature: string;
  private _nextSubFeature: string = '';
  private _storeJackpotData: any = null;

  get isErrorOccurred(): boolean {
    return this._isErrorOccurred;
  }

  set isErrorOccurred(value: boolean) {
    this._isErrorOccurred = value;
  }
  private _lightningSpinSession: boolean;
  private _isErrorOccurred: boolean;
  get lightningSpinObj(): any {
    return this._lightningSpinObj;
  }

  set lightningSpinObj(value: any) {
    this._lightningSpinObj = value;
  }
  private _lightningSpinObj: any;
  get lightningStopOnBonus(): boolean {
    return this._lightningStopOnBonus;
  }

  set lightningStopOnBonus(value: boolean) {
    this._lightningStopOnBonus = value;
  }

  get playerInfo(): any {
    return this._playerInfo;
  }

  set playerInfo(value: any) {
    this._playerInfo = value;
  }
  get featureResult(): any {
    return this._featureResult;
  }

  set featureResult(value: any) {
    this._featureResult = value;
  }
  get fsInfo(): any {
    return this._fsInfo;
  }

  set fsInfo(value: any) {
    this._fsInfo = value;
  }

  get lineWinIndex(): number {
    return this._lineWinIndex;
  }

  set lineWinIndex(value: number) {
    this._lineWinIndex = value;
  }
  get gameResult(): any {
    return this._gameResult;
  }

  set gameResult(value: any) {
    this._gameResult = value;
  }
  get turboMode(): boolean {
    return this._turboMode;
  }

  set turboMode(value: boolean) {
    this._turboMode = value;
  }
  get gameInfo(): any {
    return this._gameInfo;
  }

  set gameInfo(value: any) {
    this._gameInfo = value;
  }

  get funMode(): boolean {
    return this._funMode;
  }

  set funMode(value: boolean) {
    this._funMode = value;
  }
  get language(): string {
    return this._language;
  }

  set language(value: string) {
    this._language = value;
  }
  get currency(): string {
    return this._currency;
  }

  set currency(value: string) {
    this._currency = value;
  }

  get tumbleIndex(): number {
    return this._tumbleIndex;
  }
  set tumbleIndex(value: number) {
    this._tumbleIndex = value;
  }

  get rewardValues(): any[] {
    return this._gameResult?.rewardValues || [];
  }

  public storeLanguage(): void {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('language') || 'en';
    if (GameProxy.config.LANGUAGES_SUPPORTED.includes(lang)) {
      this.language = lang;
    } else {
      this.language = 'en';
    }
  }
  public getIsCheatMode(): boolean {
    return this.gameInfo?.allowCheat && this.gameInfo?.devMode;
  }
  public getPreferences(): { sound: boolean; showIntro: boolean } {
    return this._preferences;
  }

  public setPreferencesSound(value: boolean): void {
    this._preferences.sound = value;
  }

  public setPreferencesShow(value: boolean): void {
    this._preferences.showIntro = value;
  }

  public getIsBBAvailable(): boolean {
    return this.opConfig?.isBBAvailable && this.playerInfo?.buyFeature;
  }
  public getIsAutoAvailable(): boolean {
    return this.opConfig.isAutoAvailable;
  }
  public getIsTurboAvailable(): boolean {
    return this.opConfig.isTurboAvailable;
  }

  public storeGameInitData(data: any): void {
    this._gameInitData = data;
    if (data.preferences) {
      this._preferences = { sound: data.preferences.sound ?? true, showIntro: data.preferences.showIntro ?? true };
    }
    this.currency = data.playerInfo.currencyCode;
    this.funMode = false;
    this.gameInfo = {};
    this.fsInfo = {};
    this.rtpInfo = data.rtp;
    this._opConfig = data.opCnf;

    this.gameData = data.gameInfo.gameData;
    this.playerInfo = data.playerInfo;
    this.gameInfo.devMode = data.gameInfo.devMode;
    this.gameInfo.allowCheat = data.playerInfo.allowCheat;
    this.gameInfo.creditValue = GameProxy.config.creditValue;
    this.gameInfo.anteBet = 1;
    this.gameInfo.balance = data.playerInfo.balance;
    this.gameInfo.minBet = data.playerInfo.minBet;
    this.gameInfo.maxBet = data.playerInfo.maxBet;
    this.gameInfo.selectedLines = GameProxy.config.totalLines;
    this.gameInfo.creditValue = GameProxy.config.creditValue;
    this.gameInfo.betsArray = [];
    const len = data.playerInfo.possibleBets.length;
    const totalBetsArray: number[] = [];
    if (len > 0) {
      data.playerInfo.possibleBets.sort((a: number, b: number) => a - b);
      for (let i = 0; i < len; i++) {
        if (
          data.playerInfo.possibleBets[i] >= data.playerInfo.minBet &&
          data.playerInfo.possibleBets[i] <= data.playerInfo.maxBet
        ) {
          this.gameInfo.betsArray.push(data.playerInfo.possibleBets[i]);
        }
      }
    }

    this.gameInfo.betPos =
      this.gameInfo.betsArray.indexOf(data.playerInfo.defaultBet) > -1
        ? this.gameInfo.betsArray.indexOf(data.playerInfo.defaultBet)
        : 0;

    this.gameInfo.paytable = data.gameInfo.payTable;
    this.promoSpinInfo = data.promoInfo;
    this.unfinishedData = data.unfinishedInfo;
    if (this.unfinishedData) {
      this.setUnfinishedInfo();
    }
  }
  endPromoFSBet() {
    this.promoSpinSession = false;
    if (this.insertedPos > -1) {
      this.gameInfo.betsArray.splice(this.insertedPos, 1);
    }
    this.gameInfo.betPos =
      this.gameInfo.betsArray.indexOf(this.playerInfo.defaultBet) != undefined
        ? this.gameInfo.betsArray.indexOf(this.playerInfo.defaultBet)
        : 0;
  }
  setPromoFSBet() {
    const betPerLine = this.promoSpinInfo.betAmount / (this.gameInfo.selectedLines * this.gameInfo.creditValue);
    if (this.gameInfo.betsArray.indexOf(betPerLine) === -1) {
      this.insertSorted2dp(this.gameInfo.betsArray, betPerLine);
      this.insertedPos = this.gameInfo.betsArray.indexOf(betPerLine);
      this.gameInfo.betPos = this.insertedPos;
    } else {
      this.insertedPos = -1;
      this.gameInfo.betPos = this.gameInfo.betsArray.indexOf(betPerLine);
    }
  }
  insertSorted2dp(nums, value, decimals = 2) {
    const scale = 100 ** decimals;
    const v = Math.round(value * scale);

    const idx = nums.findIndex((n) => Math.round(n * scale) > v);
    if (idx === -1) nums.push(value);
    else nums.splice(idx, 0, value);

    return nums;
  }

  getIsPromoFSSession() {
    return this.promoSpinSession;
  }
  getIsNextPromoSpinPossible() {
    let flag = false;
    if (this.promoSpinInfo && this.promoSpinInfo.remainingPlayCount > 0) {
      flag = true;
    }
    return flag;
  }

  public isConfigError(): boolean {
    let isError = false;
    if (this.gameInfo.betsArray.length == 0 || this.gameInfo.betPos == -1) {
      isError = true;
    }
    return isError;
  }
  public getPaytableData(): any {
    return this.gameInfo.paytable;
  }
  public getIsAnteBetOn(): boolean {
    return this.unfinishedData?.ante;
  }
  public setUnfinishedInfo(): void {
    this.gameResult = this.unfinishedData;
    this._nextFeature = this.unfinishedData.nextFeature;
    this._nextSubFeature = this.unfinishedData.nextFeatureSubType;
    if (this.unfinishedData.ante) {
      const bet = this.unfinishedData.bet / GameProxy.config.anteBetMultiplier;
      this.gameInfo.betPos = this.gameInfo.betsArray.indexOf(bet);
    } else {
      this.gameInfo.betPos = this.gameInfo.betsArray.indexOf(this.unfinishedData.bet);
    }
    this.tumbleIndex = 0;

    this.featureName = this.unfinishedData.nextFeature;
    this.featureResult = this.unfinishedData.featureResults[this.unfinishedData.featureResults.length - 1];
    this.fsInfo.currentFreespin =
      this.unfinishedData.featureResults[this.unfinishedData.featureResults.length - 1].currentCount;
    this.fsInfo.totalFreespins =
      this.unfinishedData.featureResults[this.unfinishedData.featureResults.length - 1].totalCount;
    this.fsInfo.totalFreespinWinAmount =
      this.unfinishedData.featureResults[this.unfinishedData.featureResults.length - 1].totalWin;
    this.fsInfo.isClosed = this.unfinishedData.featureResults[this.unfinishedData.featureResults.length - 1].closed;
    this.fsInfo.retrigger = this.unfinishedData.featureResults[this.unfinishedData.featureResults.length - 1].retrigger;
  }

  public setAfterSpinBalance(): void {
    this.gameInfo.balance = this.gameInfo.updatedBalance;
  }
  public storeSpinResult(data: any): void {
    this.lineWinIndex = 0;
    this.tumbleIndex = 0;
    this.gameInfo.updatedBalance = data.playerInfo.balance;
    this.gameResult = null;
    this.gameResult = data.result;
    this._nextFeature = data.result.nextFeature;
    this._nextSubFeature = data.result.nextFeatureSubType;
    this.featureResult = null;
    if (data.result.featureResults) {
      this.featureResult = data.result.featureResults[data.result.featureResults?.length - 1];
      if (data.result.featureResults.length && this.featureResult.featureType == CONSTANTS.FEATURE_TYPE_FREESPIN) {
        this.featureName = data.result.featureResults[data.result.featureResults.length - 1].featureType;
        this.fsInfo.currentFreespin = data.result.featureResults[data.result.featureResults.length - 1].currentCount;
        this.fsInfo.totalFreespins = data.result.featureResults[data.result.featureResults.length - 1].totalCount;
        this.fsInfo.totalFreespinWinAmount = data.result.featureResults[data.result.featureResults.length - 1].totalWin;
        this.fsInfo.isClosed = data.result.featureResults[data.result.featureResults.length - 1].closed;
        this.fsInfo.retrigger = data.result.featureResults[data.result.featureResults.length - 1].retrigger;
      }
    }
    this.promoSpinInfo = data.promoInfo;
  }
  public storeFeatureResult(data: any): void {
    this.lineWinIndex = 0;
    this.tumbleIndex = 0;
    this.gameInfo.balance = data.playerInfo.balance;
    this.gameResult = null;
    this._nextFeature = data.result.nextFeature;
    this._nextSubFeature = data.result.nextFeatureSubType;
    // Check this fix added because for wheel features's response it doesn't have spinresults in featureResults, so we need to check if spinresults exists before accessing it.
    if (!data.result.featureResults[data.result.featureResults.length - 1].spinResults) {
      this.gameResult = null;
    } else {
      this.gameResult =
        data.result.featureResults[data.result.featureResults.length - 1].spinResults[
          data.result.featureResults[data.result.featureResults.length - 1].spinResults.length - 1
        ];
    }
    this.featureResult = data.result.featureResults[data.result.featureResults.length - 1];

    if (this.isCascadeGame()) {
      this.featureResult.featureTriggerPositions =
        this.gameResult.cascadeData[this.gameResult.cascadeData.length - 1].scatterPositions;
    } else if (this.gameResult?.featureTriggerPositions) {
      this.featureResult.featureTriggerPositions = this.gameResult.featureTriggerPositions;
    }

    this.fsInfo.currentFreespin = data.result.featureResults[data.result.featureResults.length - 1].currentCount;
    this.fsInfo.totalFreespins = data.result.featureResults[data.result.featureResults.length - 1].totalCount;
    this.fsInfo.totalFreespinWinAmount = data.result.featureResults[data.result.featureResults.length - 1].totalWin;
    this.fsInfo.isClosed = data.result.featureResults[data.result.featureResults.length - 1].closed;
    this.fsInfo.retrigger = data.result.featureResults[data.result.featureResults.length - 1].retrigger;
    this.fsInfo.maxCapReached = data.result.featureResults[data.result.featureResults.length - 1].maxCapReached;

    this.promoSpinInfo = data.promoInfo;
  }

  // public methods -------------------------------------------

  public resetGameResult(): void {
    this.gameResult = null;
    this._nextFeature = null;
    this._nextSubFeature = null;
  }
  // ------------------- All get methods ---------------------------------------------------------
  public getHomeURL(): string {
    return this.playerInfo ? this.playerInfo.homeURL : null;
    // return '';
  }
  public getReelsView(): any {
    if (this.gameResult?.reelModifiers && this.gameResult?.reelModifiers.length > 0) {
      if (this.gameResult?.reelModifiers[0]?.initialReelView) {
        return this.gameResult?.reelModifiers[0]?.initialReelView;
      }
    }
    return this.gameResult?.reelView;
  }
  public reelModifiersTriggered(): boolean {
    if (this.gameResult.reelModifiers && this.gameResult.reelModifiers.length > 0) {
      return true;
    }
    return false;
  }
  public getReelModifiersData(): any {
    if (this.gameResult.reelModifiers && this.gameResult.reelModifiers.length > 0) {
      return this.gameResult.reelModifiers[0];
    }
    return null;
  }
  public getCascadeReelsView(): any {
    if (this.gameResult?.reelModifiers && this.gameResult?.reelModifiers.length > 0) {
      if (this.gameResult?.reelModifiers[0]?.initialReelView && this.tumbleIndex === 0) {
        return this.gameResult?.reelModifiers[0]?.initialReelView;
      }
    }
    return this.gameResult?.cascadeData[this.tumbleIndex]?.reelView;
  }
  public getIsDevMode(): boolean {
    return this.gameInfo.devMode;
  }
  public getSelectedLines(): number {
    return this.gameInfo.selectedLines;
  }
  public getBetPerLine(): number {
    return this.gameInfo.betsArray[this.gameInfo.betPos];
  }

  public getMinBet(): number {
    return this.gameInfo.betsArray[0];
  }
  public getMaxBet(): number {
    return this.gameInfo.betsArray[this.gameInfo.betsArray.length - 1];
  }
  public setAnteBet(value: number): void {
    this.gameInfo.anteBet = value;
  }
  public getAnteBet(): number {
    return this.gameInfo.anteBet;
  }
  public getCreditValue(): number {
    return this.gameInfo.creditValue;
  }

  public getTotalBet(): number {
    const isAnte = GameProxy.config.isAnteEnabled;
    if (this.gameInfo.betsArray.length > 0) {
      if (isAnte) {
        if (this.gameInfo.betsArray.length > 0) {
          return this.gameInfo?.betsArray[this.gameInfo.betPos] * this.gameInfo?.anteBet;
        }
      } else {
        return this.gameInfo?.betsArray[this.gameInfo.betPos];
      }
    } else {
      return 0;
    }
  }

  public getTotalBetTemp(value: number): number {
    if (GameProxy.config.anteBetMultiplier) {
      return value * GameProxy.config.anteBetMultiplier;
    } else {
      return value;
    }
  }

  public getAllBets(): number[] {
    const bets: number[] = [];
    const len = this.gameInfo.betsArray.length;
    for (let k = 0; k < len; k++) {
      bets.push(this.gameInfo?.betsArray[k]);
    }

    return bets;
  }
  public getBalance(): number {
    return this.gameInfo?.balance;
  }
  public getBetPos(): number {
    return this.gameInfo.betPos;
  }
  public getGameInitData(): any {
    return this._gameInitData;
  }
  public getToken(): string {
    return WrapperProxy.playerData.token;
  }

  public getIsFeatureTriggered(): boolean {
    return !!this.featureResult;
  }
  public getFeatureTriggerPositions(): number[] {
    return this.featureResult?.featureTriggerPositions;
  }
  public getWinData(): any {
    // Check if cascade data exists and has win data
    if (this.gameResult?.cascadeData?.length > 0) {
      return this.gameResult.cascadeData[this.tumbleIndex].blustSymbols;
    }
    if (this.isSymbolExpanded) {
      const expansionData = this.getSymbolExpansionData();
      return expansionData?.expandedWinLines || [];
    }
    // Fall back to traditional winLines
    return this.gameResult?.winLines || [];
  }

  public getSpinWin(): number {
    if (this.isCascadeGame()) {
      return this.getTotalCascadeWin();
    }
    // If the game has a symbol expansion feature but the symbols haven't expanded yet (Phase 1),
    // return the normalWin. This ensures that win counters and Big Win presentations evaluate
    // the correct pre-expansion win amount.
    if (this.getSymbolExpansionData() && !this.isSymbolExpanded) {
      return this.getNormalWin();
    }

    return this.gameResult?.spinWin || 0;
  }

  public getReelModifiers(): any[] {
    return this.gameResult?.reelModifiers || [];
  }
  public getSymbolExpansionData(): any {
    const modifiers = this.getReelModifiers();
    if (modifiers && modifiers.length > 0) {
      return modifiers.find((mod: any) => mod.type === 'symbolExpansion');
    }
    return null;
  }
  public getLightningStrikeData(): any {
    const modifiers = this.getReelModifiers();
    if (modifiers && modifiers.length > 0) {
      return modifiers.find((mod: any) => mod.type === 'lightningStrike');
    }
    return null;
  }
  public getNormalWin(): number {
    return this.gameResult?.normalWin || 0;
  }

  public getTotalBaseWin(): number {
    if (this.isCascadeGame()) {
      return this.getTotalCascadeWin();
    }
    return this.gameResult?.totalWin;
  }

  public getIsUnfinishedFreespins(): boolean {
    return this.getIsUnfinishedGame() && this.getUnfinishedFeatureType() === 'freespins';
  }

  public getIsUnfinishedGame(): boolean {
    return !!this.unfinishedData;
  }

  public clearUnfinishedData(): void {
    this.unfinishedData = null;
  }

  public getFeatureType(): string {
    return this.featureResult?.featureType;
  }

  public getPickFeatureWinnings(): number {
    return this.featureResult.featureData.ownWin;
  }
  public getNextFeatureType(): string {
    return this._nextFeature;
  }

  public getNextSubFeatureType(): string {
    return this._nextSubFeature;
  }

  public getFeatureSubType(): string {
    return this.featureResult?.featureSubType;
  }
  public getUnfinishedFeatureType(): string {
    return this.unfinishedData.nextFeature;
  }
  public getUnfinishedFeatureSubType(): string {
    return this.unfinishedData?.nextFeatureSubType;
  }
  public getUnfinishedReel(): any {
    return this.unfinishedData.reelView;
  }

  public getUnfinishedCascadeReel(): any {
    return this.unfinishedData?.cascadeData[this.unfinishedData?.cascadeData?.length - 1].reelView;
  }

  public getFeatureName(): string {
    return this.featureName;
  }
  //BB multiplier
  public getBuyBonusFeatureName(): string {
    const settings = this.playerInfo?.bbBetMultiplierSettings;
    return settings ? Object.keys(settings)[0] : 'FG1';
  }

  public getBuyBonusMultiplier(featureType: string): number {
    return this.playerInfo?.bbBetMultiplierSettings?.[featureType] || 100;
  }

  // ---------------------------------- All set methods -----------------------------------------
  public setTotalBet(value: number) {
    this.gameInfo.betPos = this.getAllBets().indexOf(value);
  }
  public incrementDecrementBet(value: number) {
    if (value == 1) {
      if (this.gameInfo.betPos < this.gameInfo.betsArray.length - 1) {
        this.gameInfo.betPos++;
      }
    } else if (this.gameInfo.betPos > 0) {
      this.gameInfo.betPos--;
    }
  }

  public getWinType(): string {
    const win = this.getSpinWin();
    const bet = this.getTotalBet();
    const bigwinValues = GameProxy.config.bigWinValues;

    // Safety: if config is missing or empty, fall back to simple logic
    if (!Array.isArray(bigwinValues) || bigwinValues.length < 1) {
      return win <= bet ? CONSTANTS.BELOW_TOTALBET_WIN : CONSTANTS.STANDARD_WIN;
    }

    // Define thresholds from smallest "big" to largest
    // Assumes bigwinValues[0] < bigwinValues[1] < bigwinValues[2] < bigwinValues[3]
    const thresholds = [
      { multiplier: bigwinValues[0], type: CONSTANTS.BIG_WIN },
      { multiplier: bigwinValues[1], type: CONSTANTS.SUPER_WIN },
      { multiplier: bigwinValues[2], type: CONSTANTS.MEGA_WIN },
      { multiplier: bigwinValues[3], type: CONSTANTS.EPIC_WIN },
    ];

    if (win <= bet) {
      return CONSTANTS.BELOW_TOTALBET_WIN;
    }

    // Check from highest threshold to lowest
    for (let i = thresholds.length - 1; i >= 0; i--) {
      const { multiplier, type } = thresholds[i];
      if (win >= bet * multiplier) {
        return type;
      }
    }

    // Win is >= bet but below first bigWin threshold
    return CONSTANTS.STANDARD_WIN;
  }

  public getSingleCascadeWinType(): string {
    // this function is intended only to determine the win type for a single cascade.
    const win = this.getTumbleSpinWin();
    const bet = this.getTotalBet();
    const bigwinValues = GameProxy.config.bigWinValues;

    // Safety: if config is missing or empty, fall back to simple logic
    if (!Array.isArray(bigwinValues) || bigwinValues.length < 1) {
      return win <= bet ? CONSTANTS.BELOW_TOTALBET_WIN : CONSTANTS.STANDARD_WIN;
    }

    // Define thresholds from smallest "big" to largest
    // Assumes bigwinValues[0] < bigwinValues[1] < bigwinValues[2] < bigwinValues[3]
    const thresholds = [
      { multiplier: bigwinValues[0], type: CONSTANTS.BIG_WIN },
      { multiplier: bigwinValues[1], type: CONSTANTS.SUPER_WIN },
      { multiplier: bigwinValues[2], type: CONSTANTS.MEGA_WIN },
      { multiplier: bigwinValues[3], type: CONSTANTS.EPIC_WIN },
    ];

    if (win <= bet) {
      return CONSTANTS.BELOW_TOTALBET_WIN;
    }

    // Check from highest threshold to lowest
    for (let i = thresholds.length - 1; i >= 0; i--) {
      const { multiplier, type } = thresholds[i];
      if (win >= bet * multiplier) {
        return type;
      }
    }

    // Win is >= bet but below first bigWin threshold
    return CONSTANTS.STANDARD_WIN;
  }

  // ---------------------------------- Autoplay methods -----------------------------------------

  // WHEN: Called by AutoPlayConfirmBtnCommand when user starts autoplay
  // WHY: Sets up all data needed to track autoplay progress and stop conditions
  public setAutoplayInfo(obj: any): void {
    this._autoPlayObj = {
      ...obj,
      startBalance: this.getBalance(),
      currentBalance: this.getBalance(),
      currentAutoSpin: 0,
      totalAutoWin: 0,
    };
    this._autoPlaySession = true;
  }

  // WHEN: Called by SlotGameApp.checkForAutoSpin() after each spin
  // WHY: Updates totalAutoWin and maxSingleWin used by getNextAutoPossible()
  public setAutoPlayWin(win: number): void {
    if (!this._autoPlaySession) return;
    this._autoPlayObj.totalAutoWin += win;
    if (win > this._autoPlayObj.maxSingleWin) {
      this._autoPlayObj.maxSingleWin = win;
    }
    // Update current balance for balance change tracking
    this._autoPlayObj.currentBalance = this.getBalance();
    // Note: featureTriggered is now only set when feature ends, not when it starts
  }

  // WHEN: Called by SlotGameApp.checkForAutoSpin() after each spin completes
  // WHY: Tracks progress toward selectedSpins limit
  public incrementAutoSpin(): void {
    if (this._autoPlaySession) {
      this._autoPlayObj.currentAutoSpin++;
    }
  }
  public setFeatureTriggered(): void {
    if (this._autoPlayObj) {
      this._autoPlayObj.featureTriggered = true;
    }
  }

  // WHEN: Called by SlotGameApp.checkForAutoSpin() after each spin
  // WHY: Determines if autoplay continues or stops
  // RETURNS: 0=not active, 1=continue, 2=spin count reached, 3=any win,
  //          4=bonus triggered, 5=single win exceeded, 6=balance decreased, 7=balance increased
  public getNextAutoPossible(): number {
    if (!this._autoPlaySession) return 0;
    // Check stop conditions in priority order
    if (this._autoPlayObj.selectedSpins !== -1 && this._autoPlayObj.currentAutoSpin > this._autoPlayObj.selectedSpins)
      return 2;
    if (this._autoPlayObj.spendingLimit > 0) {
      const totalSpending = parseFloat(
        (this._autoPlayObj.startBalance - this.getBalance() + this.getTotalBet()).toFixed(10),
      );
      if (totalSpending > this._autoPlayObj.spendingLimit) return 3;
    }
    return 1; // Continue autoplay
  }

  // WHEN: Called by SlotGameApp.checkForAutoSpin() when autoplay stops
  // WHY: Resets state for next autoplay session
  public resetAutoplayData(): void {
    this._autoPlayObj = {
      selectedSpins: 0,
      onAnyWin: false,
      onBonusWin: false,
      onSingleWinExceeds: 0,
      balanceIncreaseBy: 0,
      balanceDecreaseBy: 0,
      startBalance: 0,
      currentAutoSpin: 0,
      featureTriggered: false,
      totalAutoWin: 0,
      maxSingleWin: 0,
    };
    this._autoPlaySession = false; // End session
  }

  // WHEN: Called by SlotGameApp to update UI counter
  // WHY: Shows user how many spins left (or current count for infinite)
  // RETURNS: For infinite (-1): current count + 1, For limited: remaining count
  public getAutoSpinCurrentCount(): string {
    if (!this._autoPlayObj) return '0';
    return this._autoPlayObj.currentAutoSpin;
  }
  public getAutoSpinTotalCount(): string {
    if (!this._autoPlayObj) return '0';
    return this._autoPlayObj.selectedSpins;
  }

  public getTotalAutoWin(): number {
    return this._autoPlayObj?.totalAutoWin || 0;
  }

  public getRTP(): number {
    return this.rtpInfo.base;
  }

  public maxExposure(): number {
    return 10000;
  }

  protected getParamsExceptBase = (data: ParamsObject): { name: string; rtp: number }[] => {
    return Object.entries(data)
      .filter(([key]) => key !== 'base')
      .map(([key, value]) => ({
        name: Util.getContent(key),
        rtp: value,
      }));
  };
  public getBBRTP(): { name: string; rtp: number }[] {
    return this.getParamsExceptBase(this.rtpInfo);
  }

  // WHEN: Called if external code needs full autoplay config
  // WHAT: Returns complete autoplay object
  public getAutoSpinObj(): any {
    return this._autoPlayObj;
  }

  // WHEN: Called by SlotGameApp.checkForAutoSpin() to check if loop should run
  // WHY: Controls whether autoplay loop executes
  public getIsAutoSession(): boolean {
    return this._autoPlaySession;
  }

  // WHEN: Called before starting autoplay or next spin
  // WHY: Prevents autoplay from starting/continuing without funds
  public getIsSpinStartPossible(): boolean {
    return this.getBalance() >= this.getTotalBet();
  }
  public getIsBBSpinStartPossible(bbId): boolean {
    const multiplier = appModel.getBuyBonusMultiplier(bbId);
    return this.getBalance() >= this.getTotalBet() * multiplier;
  }

  getbbBetMultiplierSettings(): any {
    if (this.playerInfo?.buyFeature != undefined && this.playerInfo.bbBetMultiplierSettings) {
      return this.playerInfo.bbBetMultiplierSettings;
    }
  }

  // ---------------- Lightning methods ----------------------------------------------------------
  public setLightningSpinInfo(obj: any): void {
    this.lightningSpinObj.totalLightningSpins += obj.totalLightningSpins;
    this._lightningSpinSession = true;
  }
  public resetLightningSpinData(): void {
    this.lightningSpinObj = {
      totalLightningSpins: 0,
      currentLightningSpin: 0,
      totalLightningWin: 0,
      numberOfBonusWin: 0,
      totalBonusWinAmount: 0,
      featureTriggered: false,
    };
    this._autoPlaySession = false; // End session
  }
  public incrementLightningSpin(): void {
    if (this._lightningSpinSession) {
      this._lightningSpinObj.currentLightningSpin++;
    }
  }
  public endLightningSpin(): void {
    this._lightningSpinSession = false;
    this.resetLightningSpinData();
  }
  public getIsLightningSession(): boolean {
    return this._lightningSpinSession;
  }
  public getRemainingLightningSpin(): any {
    return this.lightningSpinObj.totalLightningSpins - this.lightningSpinObj.currentLightningSpin;
  }
  public getCurrentLightningSpin(): number {
    return this.lightningSpinObj?.currentLightningSpin;
  }

  // ---------------------------------- Free spins methods -----------------------------------------

  public getIsFSTriggered(): boolean {
    return (
      this.featureResult.featureType == CONSTANTS.FEATURE_TYPE_FREESPIN &&
      this.featureResult.currentCount == 0 &&
      !this.featureResult.closed
    );
  }
  public startFreeSpinsSession(flag: boolean): void {
    this._freeSpinsSession = true;
  }

  public startPickFeatureSession(): void {
    this._pickFeatureSession = true;
  }
  public getIsPickFeatureSession(): boolean {
    return this._pickFeatureSession;
  }
  public endPickFeatureSession(): void {
    this._pickFeatureSession = false;
  }

  public getCurrentFreeSpin(): number {
    return this.fsInfo.currentFreespin + 1;
  }
  public getTotalFreespins(): number {
    return this.fsInfo.totalFreespins;
  }

  public getTotalFreespinWinAmount(): number {
    return this.fsInfo.totalFreespinWinAmount;
  }
  public getIsMaxCapReached(): boolean {
    if (this.getIsFreeSpinsSession()) {
      return this.fsInfo.maxCapReached;
    } else {
      return this.gameResult.maxCapReached;
    }
  }

  public getCurrentFreeSpinWin(): number {
    return this.gameResult?.totalWin || this.gameResult?.baseWin || 0;
  }

  public getIsFreeSpinsSession(): boolean {
    return this._freeSpinsSession;
  }
  public getIsNextFSPossible(): boolean {
    return !this.fsInfo.isClosed;
  }
  public endFreeSpinsSession(): void {
    this._freeSpinsSession = false;
  }
  public isFSRetriggered(): boolean {
    return this.fsInfo.retrigger;
  }
  public getFSRetriggerCount(): number {
    return this.featureResult.retriggerCount;
  }

  // ---------------------------------- Cascade methods -----------------------------------------
  public isCascadeGame(): boolean {
    return this.gameResult?.cascadeData && this.gameResult.cascadeData.length > 0;
  }
  public toCollectMultiplier(): boolean {
    return (
      this.gameResult?.multiplierPositions &&
      this.gameResult?.multiplierPositions.length > 0 &&
      this.gameResult?.cascadeData?.length > 1
    );
  }

  public getScatterPay(): number {
    return this.gameResult.cascadeData[this.tumbleIndex].scatterPay;
  }
  public getTotalCascadeWin(): number {
    return this.gameResult.totalWin;
  }
  public getTumbleSpinWin(): number {
    return this.gameResult.cascadeData[this.tumbleIndex].spinWin;
  }
  public isTumbleRemaining(): boolean {
    return this.tumbleIndex < this.gameResult?.cascadeData?.length - 1;
  }
  public getSpinBlastData(): any {
    return this.gameResult?.cascadeData[this.tumbleIndex]?.blustSymbols;
  }
  public getSpinBlastSymbols(): any {
    const blastSymbols = this.getWinData();
    const len = blastSymbols.length;
    const allBlasts = [];
    for (let i = 0; i < len; i++) {
      allBlasts.push(blastSymbols[i].positions);
    }
    return allBlasts;
  }
  public getLineWinBlastSymbols(): any {
    const winData = this.getWinData();
    return winData?.[this.lineWinIndex]?.blustSymbols;
  }
  public getCurrentLineWinData(): any {
    const winData = this.getWinData();
    return winData?.[this.lineWinIndex];
  }
  public getWinDataLength(): number {
    const winData = this.getWinData();
    return Array.isArray(winData) ? winData.length : 0;
  }
  public getSpinBlastPositions(): any {
    return Util.combineBlastPoisitions(this.gameResult.cascadeData[this.tumbleIndex]?.blustSymbols);
  }
  public getNextCascadeReelsView(): any {
    return this.gameResult.cascadeData[this.tumbleIndex + 1].reelView;
  }
  public getConvertedJWildPositions(): any {
    return this.gameResult.cascadeData[this.tumbleIndex + 1]?.convertedJWildPositions || [];
  }
  public getLandedJWildPositions(): any {
    return this.gameResult.cascadeData[this.tumbleIndex + 1]?.firstJWildPosition || [];
  }
  public getSpinResult(): any {
    return this.gameResult;
  }
  public getSymbolPayoutValue(multi: number): number {
    return (this.getTotalBet() / (this.gameInfo.creditValue * this.gameInfo.selectedLines)) * multi;
  }
  public getSymbMultiplierValue(reel: number, row: number) {
    const multiplierPositions = this.gameResult.cascadeData[this.tumbleIndex]?.multiplierPositions;
    return (
      multiplierPositions.find((item) => item.position[0] === reel && item.position[1] === row)?.multiplier ?? null
    );
  }
  public getMultiplierPositionData() {
    return this.gameResult.cascadeData[this.tumbleIndex]?.multiplierPositions;
  }
  public getFreeSpinMultiplier() {
    return this.gameResult?.freeSpinMultiplier;
  }
  public getInitialFreeSpinMultiplier() {
    // have to change once get the new BE as currently the values are pretty nested
    return this.gameResult?.featureResults[this.gameResult?.featureResults.length - 1].currentCount
      ? this.gameResult?.featureResults[this.gameResult?.featureResults.length - 1].spinResults[0].freeSpinMultiplier
      : 0;
  }
  public getSpinRemainingTime(): number {
    if (!this.opConfig?.spinDuration) {
      return 0;
    } else {
      const diff: number = Util.getCurrentTimeInMili() - this.spinStartTime;
      return this.opConfig.spinDuration - diff;
    }
  }
}

export const appModel = new AppModelService();
