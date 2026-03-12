import { isMobile } from 'pixi.js';
import { AbstractProxy } from '@core/models/AbstractProxy';
class DeviceConfigProxy extends AbstractProxy {
  get stageScale(): number {
    return this._stageScale;
  }

  set stageScale(value: number) {
    this._stageScale = value;
  }
  protected _config!: any;

  get config(): any {
    return this._config;
  }
  private _stageScale: number;

  public getIsLocal(): boolean {
    return import.meta.env.VITE_IS_STANDALONE === 'true';
  }
  public readDevice(): void {
    this._config = {};
    this._config.hostName = location.hostname;
    this._config.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    this._config.windowHeight =
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this._config.isIOSDevice = isMobile.apple.device;
    this._config.isIOSMobile = isMobile.apple.phone;
    this._config.isTablet = isMobile.tablet;

    this._config.isDesktop = this.isDesktop();
    this._config.isMobile = isMobile.phone;
    this._config.isDevice = this._config.isMobile || this._config.isTablet;

    this._config.isIE11 = false;
    this._config.isLandscape = false;
    this._config.isPortrait = false;
    this._config.orientation = this.checkOrientation();
    if (this._config.orientation === 1) {
      this._config.isLandscape = true;
      this._config.scaleFactor = this._config.windowWidth / this._config.windowHeight;
    } else {
      this._config.isPortrait = true;
      this._config.scaleFactor = this._config.windowHeight / this._config.windowWidth;
    }

    this._config.pixelRatio = 1;
    this._config.fontFactor = window.devicePixelRatio;
    this._config.pixelRatioString = '@' + this._config.pixelRatio + 'x';
    this._config.appResolution = this._config.pixelRatio;
    this._config.assetResolution = '@1x'; // to do for mobile diff res;

    if (this._config.isDesktop || this._config.isTablet) {
      this._config.assetResolution = '@1x';
    } else {
      this._config.assetResolution = '@0.5x';
    }
    this._config.gameWidth = this._config.windowWidth * this._config.appResolution;
    this._config.gameHeight = this._config.windowHeight * this._config.appResolution;
  }

  isDesktop(): boolean {
    return !isMobile.phone && !isMobile.tablet;
  }
  isDevice(): boolean {
    return !this.isDesktop();
  }

  checkOrientation(): number {
    let wid = this._config.windowWidth;
    let ht = this._config.windowHeight;
    if (wid === undefined) {
      wid = window.innerWidth;
    }
    if (ht === undefined) {
      ht = window.innerHeight;
    }
    if (typeof wid != 'number') {
      wid = Number(wid);
    }
    if (typeof ht != 'number') {
      ht = Number(ht);
    }
    let o = 1;
    if (ht > wid) {
      o = 2;
    }
    return o;
  }
}

export const DeviceProxy = new DeviceConfigProxy();
