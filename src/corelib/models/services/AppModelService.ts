import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
import { CONSTANTS } from '@core/utils/CONSTANTS';

class AppModelService {
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
  private _lineWinIndex: number = 0;
  private _autoPlayObj: any;
  private _autoPlaySession: boolean = false;
  private _freeSpinsSession: boolean;
  private _tumbleIndex: number;
  private _lightningStopOnBonus: boolean;

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

  public storeGameInitData(data: any): void {
    this._gameInitData = data;
    this.language = data.playerInfo.language;
    this.currency = data.playerInfo.currencyCode;
    this.funMode = false;
    this.gameInfo = {};
    this.fsInfo = {};
    this.playerInfo = data.playerInfo;
    this.gameInfo.devMode = data.gameInfo.devMode;
    this.gameInfo.creditValue = GameProxy.config.creditValue;
    this.gameInfo.balance = data.playerInfo.balance;
    this.gameInfo.betsArray = data.playerInfo.possibleBets;
    this.gameInfo.minBet = data.playerInfo.minBet;
    this.gameInfo.maxBet = data.playerInfo.maxBet;
    this.gameInfo.betPos = this.gameInfo.betsArray.indexOf(data.playerInfo.defaultBet);
    this.gameInfo.selectedLines = GameProxy.config.totalLines;
    this.gameInfo.paytable = data.gameInfo.paytable;
    this.unfinishedData = data.unfinishedInfo;
    if (this.unfinishedData) {
      this.setUnfinishedInfo();
    }
  }
  public getPaytableData(): any {
    return this.gameInfo.paytable;
  }
  public setUnfinishedInfo(): void {
    this.gameInfo.betPos = this.gameInfo.betsArray.indexOf(this.unfinishedData.bet / this.gameInfo.creditValue);
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

  public storeSpinResult(data: any): void {
    this.lineWinIndex = 0;
    this.tumbleIndex = 0;
    // const data = {
    //   gameId: 'megaace',
    //   playerId: '1507320',
    //   roundId: '7AIaLQUM4jm5E_bJZ92n3',
    //   closed: true,
    //   result: {
    //     cascadeData: [
    //       {
    //         reelView: [
    //           ['H4', 'L2', 'L4', 'H3'],
    //           ['L1', 'L2_G', 'H2', 'L4'],
    //           ['L4', 'H2', 'L2_G', 'L1'],
    //           ['L2', 'H3', 'L3_G', 'H1'],
    //           ['L3', 'H4', 'L2', 'H1'],
    //         ],
    //         scatterCount: 0,
    //         blustSymbols: [
    //           {
    //             symbol: 'L2',
    //             noOfWays: 1,
    //             positions: [
    //               [0, 1],
    //               [1, 1],
    //               [2, 2],
    //               [3, 0],
    //               [4, 2],
    //             ],
    //             symbolPay: 10,
    //             winAmount: 10,
    //             scatterMultiplier: 0,
    //           },
    //           {
    //             symbol: 'L4',
    //             noOfWays: 1,
    //             positions: [
    //               [0, 2],
    //               [1, 3],
    //               [2, 0],
    //             ],
    //             symbolPay: 1,
    //             winAmount: 1,
    //             scatterMultiplier: 0,
    //           },
    //         ],
    //         willConvertToWildPositions: [
    //           {
    //             symbol: 'L2_G',
    //             positions: [1, 1],
    //             wildType: 'WD',
    //           },
    //           {
    //             symbol: 'L2_G',
    //             positions: [2, 2],
    //             wildType: 'JWD',
    //           },
    //         ],
    //         spinWin: 11,
    //         scatterPositions: [],
    //       },
    //       {
    //         reelView: [
    //           ['H4', 'L4', 'H4', 'H3'],
    //           ['L1', 'WD', 'H2', 'L1'],
    //           ['H2_G', 'H2', 'JWD', 'L1'],
    //           ['L1', 'H3', 'JWD', 'H1'],
    //           ['L3', 'H4', 'L3', 'H1'],
    //         ],
    //         convertedWildPositions: [
    //           {
    //             position: [1, 1],
    //             prevSymbol: 'L2_G',
    //           },
    //         ],
    //         firstJWildPosition: [
    //           {
    //             position: [2, 2],
    //             prevSymbol: 'L2_G',
    //           },
    //         ],
    //         convertedJWildPositions: [
    //           {
    //             position: [3, 2],
    //             prevSymbol: 'L3_G',
    //           },
    //         ],
    //         scatterCount: 0,
    //         blustSymbols: [
    //           {
    //             symbol: 'H4',
    //             noOfWays: 2,
    //             positions: [
    //               [0, 0],
    //               [0, 2],
    //               [1, 1],
    //               [2, 2],
    //               [3, 2],
    //               [4, 1],
    //             ],
    //             symbolPay: 40,
    //             winAmount: 80,
    //             scatterMultiplier: 0,
    //           },
    //           {
    //             symbol: 'L4',
    //             noOfWays: 1,
    //             positions: [
    //               [0, 1],
    //               [1, 1],
    //               [2, 2],
    //               [3, 2],
    //             ],
    //             symbolPay: 6,
    //             winAmount: 6,
    //             scatterMultiplier: 0,
    //           },
    //           {
    //             symbol: 'H3',
    //             noOfWays: 2,
    //             positions: [
    //               [0, 3],
    //               [1, 1],
    //               [2, 2],
    //               [3, 1],
    //               [3, 2],
    //             ],
    //             symbolPay: 36,
    //             winAmount: 72,
    //             scatterMultiplier: 0,
    //           },
    //         ],
    //         willConvertToWildPositions: [],
    //         spinWin: 158,
    //         scatterPositions: [],
    //       },
    //       {
    //         reelView: [
    //           ['L2', 'H3', 'H2', 'H3'],
    //           ['L1', 'H4_G', 'H2', 'L1'],
    //           ['H2_G', 'H2', 'H1', 'L1'],
    //           ['L1', 'L1', 'L1', 'H1'],
    //           ['L3', 'L1', 'L3', 'H1'],
    //         ],
    //         convertedWildPositions: [],
    //         firstJWildPosition: [],
    //         convertedJWildPositions: [],
    //         scatterCount: 0,
    //         blustSymbols: [
    //           {
    //             symbol: 'H2',
    //             noOfWays: 2,
    //             positions: [
    //               [0, 2],
    //               [1, 2],
    //               [2, 0],
    //               [2, 1],
    //             ],
    //             symbolPay: 24,
    //             winAmount: 48,
    //             scatterMultiplier: 0,
    //           },
    //         ],
    //         willConvertToWildPositions: [
    //           {
    //             symbol: 'H2_G',
    //             positions: [2, 0],
    //             wildType: 'WD',
    //           },
    //         ],
    //         spinWin: 48,
    //         scatterPositions: [],
    //       },
    //       {
    //         reelView: [
    //           ['L2', 'H3', 'L3', 'H3'],
    //           ['L1', 'H4_G', 'L1', 'L1'],
    //           ['WD', 'H2', 'H1', 'L1'],
    //           ['L1', 'L1', 'L1', 'H1'],
    //           ['L3', 'L1', 'L3', 'H1'],
    //         ],
    //         convertedWildPositions: [
    //           {
    //             position: [2, 0],
    //             prevSymbol: 'H2_G',
    //           },
    //         ],
    //         firstJWildPosition: [],
    //         convertedJWildPositions: [],
    //         scatterCount: 0,
    //         blustSymbols: [],
    //         willConvertToWildPositions: [],
    //         spinWin: 0,
    //         scatterPositions: [],
    //       },
    //     ],
    //     bet: '20',
    //     totalWin: 217,
    //     baseWin: 217,
    //     nextFeature: null,
    //     pendingFeature: 0,
    //     featureResults: [],
    //     winMultiplier: 5,
    //     active: false,
    //     JWildAwarded: true,
    //     JWildRewarded: true,
    //     maxWin: 1000,
    //     maxCapReached: false,
    //   },
    //   id: '7AIaLQUM4jm5E_bJZ92n3',
    //   playerInfo: {
    //     balance: 612025.7990000001,
    //     endTime: '2025-12-16T12:30:19.998Z',
    //   },
    // };
    this.gameInfo.balance = data.playerInfo.balance;
    this.gameResult = data.result;
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
  }
  public storeFeatureResult(data: any): void {
    this.lineWinIndex = 0;
    this.tumbleIndex = 0;
    this.gameInfo.balance = data.playerInfo.balance;
    this.gameResult =
      data.result.featureResults[data.result.featureResults.length - 1].spinResults[
        data.result.featureResults[data.result.featureResults.length - 1].spinResults.length - 1
      ];
    this.featureResult = data.result.featureResults[data.result.featureResults.length - 1];
    this.fsInfo.currentFreespin = data.result.featureResults[data.result.featureResults.length - 1].currentCount;
    this.fsInfo.totalFreespins = data.result.featureResults[data.result.featureResults.length - 1].totalCount;
    this.fsInfo.totalFreespinWinAmount = data.result.featureResults[data.result.featureResults.length - 1].totalWin;
    this.fsInfo.isClosed = data.result.featureResults[data.result.featureResults.length - 1].closed;
    this.fsInfo.retrigger = data.result.featureResults[data.result.featureResults.length - 1].retrigger;

    this.fsInfo.maxCapReached = data.result.featureResults[data.result.featureResults.length - 1].maxCapReached;
  }

  // public methods -------------------------------------------

  // ------------------- All get methods ---------------------------------------------------------
  public getHomeURL(): string {
    // return this.playerInfo ? this.playerInfo.homeURL : null;
    return '';
  }
  public getReelsView(): any {
    return Util.cloneArray(this.gameResult.reelView);
  }
  public getCascadeReelsView(): any {
    return Util.cloneArray(this.gameResult.cascadeData[this.tumbleIndex].reelView);
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

  public getTotalBet(): number {
    return this.gameInfo.betsArray[this.gameInfo.betPos] * this.gameInfo.creditValue;
  }
  public getAllBets(): number[] {
    const bets: number[] = [];
    const len = this.gameInfo.betsArray.length;
    for (let k = 0; k < len; k++) {
      bets.push(this.gameInfo.betsArray[k] * this.gameInfo.creditValue);
    }
    return bets;
  }
  public getBalance(): number {
    return this.gameInfo.balance;
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
    // Fall back to traditional winLines
    return this.gameResult?.winLines || [];
  }
  public getSpinWin(): number {
    if (this.isCascadeGame()) {
      return this.getTumbleSpinWin();
    }
    return this.gameResult.spinWin;
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

  public getUnfinishedFeatureType(): string {
    return this.unfinishedData.nextFeature;
  }

  public getUnfinishedReel(): any {
    if (this.unfinishedData.cascadeData?.length > 0) {
      return this.getUnfinishedCascadeReel();
    }
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
    } else {
      if (this.gameInfo.betPos > 0) {
        this.gameInfo.betPos--;
      }
    }
  }

  public getWinType(): string {
    const win = this.getSpinWin();
    const bet = this.getTotalBet();
    const bigwinValues = GameProxy.config.bigWinValues;

    // Safety: if config is missing or empty, fall back to simple logic
    if (!Array.isArray(bigwinValues) || bigwinValues.length < 1) {
      return win < bet ? CONSTANTS.BELOW_TOTALBET_WIN : CONSTANTS.STANDARD_WIN;
    }

    // Define thresholds from smallest "big" to largest
    // Assumes bigwinValues[0] < bigwinValues[1] < bigwinValues[2] < bigwinValues[3]
    const thresholds = [
      { multiplier: bigwinValues[0], type: CONSTANTS.BIG_WIN },
      { multiplier: bigwinValues[1], type: CONSTANTS.MEGA_WIN },
      { multiplier: bigwinValues[2], type: CONSTANTS.GIGANTIC_WIN },
      { multiplier: bigwinValues[3], type: CONSTANTS.UNBELIEVABLE_WIN },
    ];

    if (win < bet) {
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
      maxSingleWin: 0,
      featureTriggered: false,
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
    const obj = this._autoPlayObj;
    // Check stop conditions in priority order
    if (obj.selectedSpins !== -1 && obj.currentAutoSpin > obj.selectedSpins) return 2;
    if (obj.onAnyWin && obj.totalAutoWin > 0) return 3;
    if (obj.onBonusWin && obj.featureTriggered) return 4;
    if (obj.onSingleWinExceeds > 0 && obj.maxSingleWin > obj.onSingleWinExceeds) return 5;
    if (obj.balanceDecreaseBy > 0 && obj.startBalance - this.getBalance() + this.getTotalBet() > obj.balanceDecreaseBy)
      return 6;
    if (obj.balanceIncreaseBy > 0 && this.getBalance() - obj.startBalance > obj.balanceIncreaseBy) return 7;

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
  public getAutoSpinRemainingCount(): string {
    if (!this._autoPlayObj) return '0';
    return this._autoPlayObj.currentAutoSpin + '/' + this._autoPlayObj.selectedSpins; // Remaining spins
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
    if (this.playerInfo && this.playerInfo.buyFeature != undefined && this.playerInfo.bbBetMultiplierSettings) {
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
    return this.fsInfo.maxCapReached;
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
    return Util.cloneArray(this.gameResult?.cascadeData[this.tumbleIndex]?.blustSymbols);
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
    return Util.cloneArray(this.gameResult.cascadeData[this.tumbleIndex + 1].reelView);
  }
  public getConvertedJWildPositions(): any {
    return Util.cloneArray(this.gameResult.cascadeData[this.tumbleIndex + 1]?.convertedJWildPositions || []);
  }
  public getLandedJWildPositions(): any {
    return Util.cloneArray(this.gameResult.cascadeData[this.tumbleIndex + 1]?.firstJWildPosition || []);
  }
  public getSymbolPayoutValue(multi: number): number {
    return (this.getTotalBet() / this.gameInfo.creditValue) * multi;
  }
}

export const appModel = new AppModelService();
