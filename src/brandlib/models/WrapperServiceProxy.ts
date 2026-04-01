import { AbstractProxy } from '@core/models/AbstractProxy';
import { appModel } from '@core/models/services/AppModelService';

class WrapperServiceProxy extends AbstractProxy {
  get playerData(): any {
    return this._playerData;
  }

  set playerData(value: any) {
    this._playerData = value;
  }
  private _playerData!: any;

  public readURLParams(ref: any): void {
    this.facade = ref;
    this.registerProxy(ref);
    this.playerData = {};

    const result: string[] = window.location.href.substring(0).split('#')[0].split('?');

    if (result[1]) {
      const params: string[] = result[1].split('&');
      const len: number = params.length;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          const values: string[] = params[i].split('=');
          if (values[0].length > 0) {
            this.playerData[values[0]] = typeof values[1] === 'undefined' ? '' : values[1];
          }
        }
      }
    }

    if (this.playerData.language != undefined) {
      this.playerData.language = this.playerData.language.toLowerCase();
    }
    if (this.playerData.playerId == undefined) {
      this.playerData.playerId = Math.round(Math.random() * 10000000);
    }
    if (this.playerData.token == undefined) {
      this.playerData.token = '61d44c3121cb4f524f4daecf';
    }

    this.playerData.currency = this.playerData.currency ? this.playerData.currency.toUpperCase() : 'GBP';
    this.playerData.language = this.playerData.language ? this.playerData.language.toLowerCase() : 'en';
    this.playerData.newToken = this.playerData.token;

    /*window.gameExtension = (data: any) => {
      this.onWrapperMessage(data);
    };*/
  }
  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public getPlayerId(): string {
    return this.playerData.playerId;
  }
  public getBEToken(): string {
    return this.playerData.newToken;
  }

  //communication msg from wrapper
  public onWrapperMessage(data: any): void {
    //console.log('WRAPPER MESSAGE ==', data.type);
    switch (data.type) {
      default:
        break;
    }
  }

  // util methods
  protected postDataToWrapper(data: any): void {
    // console.log('POST TO WRAPPER == ', data);
    window.parent.postMessage(data, '*');
  }

  // messages to wrapper
  public notifyLoadingStart(): void {}
  public sendCanvasReady(): void {}
}

export const WrapperProxy = new WrapperServiceProxy();
