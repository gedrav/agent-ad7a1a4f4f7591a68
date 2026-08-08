import CryptoJS from 'crypto-js';
import { AbstractProxy } from '@core/models/AbstractProxy';
import { HTTPService } from '@core/models/services/HTTPService';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { WrapperProxy } from '@brand/models/WrapperServiceProxy';
export class MessageServiceProxy extends AbstractProxy {
  private readonly isClientsSet: boolean = false;
  private readonly communicationService: HTTPService;

  constructor() {
    super();
    this.communicationService = new HTTPService(this);
  }

  public get clientSet(): boolean {
    return this.isClientsSet;
  }

  public connectToServer(): void {}

  protected checkForServerError(msgName: string, data: any): boolean {
    if (data?.errorCode == 0 || data?.errorCode == null) {
      return false;
    } else {
      EventHandler.dispatchEvent(SlotEvents.HANDLE_SERVER_ERROR, { msgName: msgName, data: data });
      return true;
    }
  }
  protected showServerError(data: any): void {}

  public async handleServerResponse(msgName: string, data: any) {
    const flag = this.checkForServerError(msgName, data);
    //console.log('handleServerResponse', msgName, data, flag);
    if (!flag) {
      switch (msgName) {
        case 'gameinit':
          appModel.storeGameInitData(data);
          EventHandler.dispatchEvent(SlotEvents.GAME_INIT_SUCCESS);
          break;
        case 'spinresult':
          appModel.storeSpinResult(data);
          EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
          break;
        case 'featureResult':
          appModel.storeFeatureResult(data);
          EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
          break;
        default:
          break;
      }
    }
  }

  public onServerError(msgName: string, error: any): void {
    appModel.isErrorOccurred = true;
    EventHandler.dispatchEvent(SlotEvents.HANDLE_SERVER_ERROR, { msgName: msgName, data: error });
  }

  public requestGameInit() {
    const gameinitObj = this.getGameInitRequestObject();
    this.communicationService.getServerResponse('gameinit', gameinitObj, 'init', 'POST');
  }
  async requestSpinResult(isBuyBonus = false) {
    const spinRequest = this.getSpinRequestObject(isBuyBonus);
    await this.communicationService.getServerResponse('spinresult', spinRequest, 'spin', 'POST');
  }
  async requestBonusData(name, selection = '') {
    const bonusRequest = this.getBonusRequestObject(name, selection);
    await this.communicationService.getServerResponse('featureResult', bonusRequest, 'feature', 'POST');
  }

  getGameInitRequestObject() {
    const finalObj: any = {};
    finalObj.gameId = GameProxy.config.gameId;
    finalObj.playerId = WrapperProxy.playerData.playerId;
    finalObj.token = WrapperProxy.playerData.newToken;
    finalObj.deviceType = this.getDeviceType();
    return this.encryptObject(finalObj);
  }
  getSpinRequestObject(isBuyBonus) {
    const finalObj: any = {};
    finalObj.gameId = GameProxy.config.gameId;
    finalObj.playerId = WrapperProxy.playerData.playerId;
    finalObj.betAmount = appModel.getTotalBet();
    finalObj.token = WrapperProxy.playerData.newToken;

    if (GameProxy.config.dontSendBBRequest) {
    } else {
      finalObj.buyBonus = {};
      if (isBuyBonus) {
        finalObj.buyBonus.bb = true;
        finalObj.buyBonus.feature = GameProxy.config.buyBonusFeatureId;
        finalObj.buyBonus.multiplier = GameProxy.config.buyBonusBetMultiplier;
      }
    }

    finalObj.extraData = {};
    if (GameProxy.config.isAnteEnabled) {
      finalObj.extraData.ante = true;
    }
    if (appModel.getIsPromoFSSession()) {
      finalObj.usePromo = true;
    }
    if (GameProxy.config.cheatObject && appModel.getIsDevMode()) {
      const cheatObj = GameProxy.config.cheatObject;
      if (cheatObj.length <= 0) {
        finalObj.combination = 'none';
      } else if (cheatObj[0] && typeof cheatObj[0] === 'object' && cheatObj[0].superScatterCheat) {
        // special case: super scatter for olympus added
        finalObj.superScatterCheat = cheatObj[0].superScatterCheat;
        finalObj.combination = cheatObj[1].combination;
      } else if (cheatObj[0] && typeof cheatObj[0] === 'object' && cheatObj[0].maxProgressiveMultiplier) {
        // special case: max mulitplier 1024 for sugar frenzy added
        finalObj.maxProgressiveMultiplier = true;
      } else if (GameProxy.config.megaWaysGame) {
        // for megways game cheat added
        finalObj.cheat = {};
        finalObj.cheat.reelType = cheatObj.reelType;
        finalObj.cheat.reelStopPos = cheatObj.reelStopPos;
        finalObj.cheat = JSON.stringify(finalObj.cheat);
        finalObj.extraData.combination = cheatObj;
      } else if (GameProxy.config.cheatObject == 'WildBurst1') {
        finalObj.extraData.forceAddWildFeature = true;
        finalObj.extraData.forceWildsAdded = 1;
      } else if (GameProxy.config.cheatObject == 'WildBurst2') {
        finalObj.extraData.forceAddWildFeature = true;
        finalObj.extraData.forceWildsAdded = 2;
      } else if (GameProxy.config.cheatObject == 'WildBurst3') {
        finalObj.extraData.forceAddWildFeature = true;
        finalObj.extraData.forceWildsAdded = 3;
      } else if (GameProxy.config.cheatObject == 'LowToHighConversion') {
        finalObj.extraData.forceSymbolChange = true;
      } else if (GameProxy.config.cheatObject.forceBonusMultiplier) {
        finalObj.extraData.forceBonusMultiplier = cheatObj.forceBonusMultiplier;
        finalObj.extraData.combination = cheatObj.combination;
      } else if (GameProxy.config.cheatObject.forceSymbolConversion) {
        finalObj.extraData.forceSymbolConversion = cheatObj.forceSymbolConversion;
        finalObj.extraData.combination = cheatObj.combination;
      } else if (GameProxy.config.cheatObject.forceNudgeFeature) {
        finalObj.extraData.forceNudgeFeature = cheatObj.forceNudgeFeature;
        finalObj.extraData.combination = cheatObj.combination;
        if (GameProxy.config.cheatObject.forceNudgeReels) {
          finalObj.extraData.forceNudgeReels = cheatObj.forceNudgeReels;
        }
      } else if (GameProxy.config.cheatObject.forceBookSymbol || GameProxy.config.cheatObject.forceFeatureType) {
        if (cheatObj.forceBookSymbol) {
          finalObj.extraData.forceBookSymbol = cheatObj.forceBookSymbol;
          finalObj.extraData.combination = cheatObj.combination;
        }
        if (cheatObj.forceFeatureType) {
          // Lightning_Trigger-style cheat: { forceFeatureType, forceWildCount, forceLightningWildCount }
          finalObj.extraData.forceFeatureType = cheatObj.forceFeatureType;
          finalObj.extraData.forceWildCount = cheatObj.forceWildCount;
          finalObj.extraData.forceLightningWildCount = cheatObj.forceLightningWildCount;
        }
      } else if (cheatObj.extraData) {
        Object.assign(finalObj.extraData, cheatObj.extraData);
      } else {
        finalObj.extraData.combination = cheatObj;
      }
    }
    return this.encryptObject(finalObj);
  }

  getBonusRequestObject(name, selection) {
    const finalObj: any = {};
    finalObj.gameId = GameProxy.config.gameId;
    finalObj.playerId = WrapperProxy.playerData.playerId; //CoreLib.Model.GameConfig.playerId;
    finalObj.token = WrapperProxy.playerData.newToken;
    finalObj.featureName = name;
    if (selection) {
      finalObj.selection = selection;
    }
    if (GameProxy.config.sendBetPerLineInFeature) {
      finalObj.betPerLine = appModel.getBetPerLine();
    } else {
    }
    finalObj.extraData = {};
    if (GameProxy.config.cheatObject && appModel.getIsDevMode()) {
      const cheatObj = GameProxy.config.cheatObject;
      if (cheatObj.length <= 0) {
        finalObj.combination = 'none';
      } else if (GameProxy.config.cheatObject.forceBonusMultiplier) {
        finalObj.extraData = {};
        finalObj.extraData.forceBonusMultiplier = cheatObj.forceBonusMultiplier;
        finalObj.extraData.combination = cheatObj.combination;
      } else if (GameProxy.config.cheatObject.freespincheat) {
        finalObj.extraData = {};
        finalObj.extraData.combination = cheatObj.combination;
      }
      // Fix added to use cheat in featureReq too
      else if (cheatObj.extraData) {
        Object.assign(finalObj.extraData, cheatObj.extraData);
      }
    }
    return this.encryptObject(finalObj);
  }

  getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad|tablet/.test(ua) ? 'mobile' : 'desktop';
  }

  encryptObject(obj) {
    const newobj = {};
    //let passPhrase = CoreLib.Model.GameConfig.passPhrase;
    for (const p in obj) {
      if (typeof obj[p] === 'object' && obj[p] !== null && p != 'combination') {
        // If the property is an object, recursively encrypt it
        newobj[p] = this.encryptObject(obj[p]);
      } else {
        // Encrypt non-object properties
        newobj[p] = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(obj[p]));
      }
    }
    return newobj;
  }

  async savePreferences(preferences: { sound: boolean; showIntro: boolean }): Promise<void> {
    const request = { token: WrapperProxy.getBEToken(), preferences };
    await this.communicationService.getServerResponse(
      'savePreferences',
      request,
      `${import.meta.env.VITE_EXTERNAL_URL}/player/preferences`,
      'PUT',
    );
  }
}

export const MessageProxy = new MessageServiceProxy();
