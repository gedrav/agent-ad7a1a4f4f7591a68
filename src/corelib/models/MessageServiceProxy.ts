import CryptoJS from 'crypto-js';
import { AbstractProxy } from '@core/models/AbstractProxy';
import { HTTPService } from '@core/models/services/HTTPService';
import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { WrapperProxy } from '@core/models/WrapperServiceProxy';
export class MessageServiceProxy extends AbstractProxy {
  private isClientsSet: boolean = false;
  private communicationService: HTTPService;

  constructor() {
    super();
    this.communicationService = new HTTPService(this);
  }

  public get clientSet(): boolean {
    return this.isClientsSet;
  }

  public connectToServer(): void {}

  private subscribeToSocketEvents() {}

  protected checkForServerError(msgName: string, data: any): boolean {
    if ((data && data.errorCode == 0) || data.errorCode == null) {
      return false;
    } else {
      EventHandler.dispatchEvent(SlotEvents.HANDLE_SERVER_ERROR, { msgName: msgName, data: data });
      return true;
    }
  }
  protected showServerError(data: any): void {}

  public async handleServerResponse(msgName: string, data: any) {
    const flag = this.checkForServerError(msgName, data);
    if (!flag) {
      switch (msgName) {
        case 'gameinit':
          appModel.storeGameInitData(data);
          break;
        case 'spinresult':
          appModel.storeSpinResult(data);
          break;
        case 'featureResult':
          appModel.storeFeatureResult(data);
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

  async requestGameInit() {
    const gameinitObj = this.getGameInitRequestObject();
    const url = GameProxy.config.baseURL + GameProxy.config.initURL; //crash.live
    //const url = GameProxy.config.baseURL + GameProxy.config.gameId + '/' + GameProxy.config.initURL; //crash.live
    await this.communicationService.getServerResponse('gameinit', gameinitObj, url, 'POST');
  }
  async requestSpinResult(isBuyBonus = false) {
    const spinRequest = this.getSpinRequestObject(isBuyBonus);
    const url = GameProxy.config.baseURL + GameProxy.config.spinURL;
    await this.communicationService.getServerResponse('spinresult', spinRequest, url, 'POST');
  }
  async requestBonusData(name, selection = '') {
    const bonusRequest = this.getBonusRequestObject(name, selection);
    const url = GameProxy.config.baseURL + GameProxy.config.bonusURL;
    await this.communicationService.getServerResponse('featureResult', bonusRequest, url, 'POST');
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
    if (GameProxy.config.sendTotalBetInRequest) {
      finalObj.betAmount = appModel.getTotalBet();
    } else {
      finalObj.betPerLine = appModel.getBetPerLine();
      finalObj.lineSelected = appModel.getSelectedLines();
    }
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
    if (GameProxy.config.cheatObject && appModel.getIsDevMode()) {
      const cheatObj = GameProxy.config.cheatObject;
      if (cheatObj.length <= 0) {
        finalObj.combination = 'none';
      } else {
        if (cheatObj[0] && typeof cheatObj[0] === 'object' && cheatObj[0].superScatterCheat) {
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
        } else {
          finalObj.combination = cheatObj;
        }
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
}

export const MessageProxy = new MessageServiceProxy();
