import * as PIXI from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { AssetLoader } from '@core/models/services/AssetLoader';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
export class PixView extends PIXI.Container {
  protected isDestroyed = false;
  private _configData: any;
  private _configDataBackup: any;
  public elementsList: { [key: string]: any };
  public guideRect: PixGraphics;
  protected viewCreated: boolean;

  constructor(configData: any = null) {
    super();
    this.configData = {};
    this._configDataBackup = {};
    // cloning
    for (const p in configData) {
      this.configData[p] = configData[p];
    }
    if (this.configData.storeBackupLayoutData) {
      for (const p in configData) {
        this._configDataBackup[p] = configData[p];
      }
    }
    this.label = this.configData.label ? this.configData.label : this.configData.name;

    if (this.configData.requiredBundle) {
      if (appModel.isBundleLoaded(this.configData.requiredBundle)) {
        this.createView();
      } else {
        console.log('bundle not loaded yet');
      }
    } else {
      if (this.configData.dontCreateView) {
        return;
      }
      this.createView();
    }

    EventHandler.addEventListener(AppEvents.SECONDARY_ASSETS_LOADED, this.onSecondaryAssetsLoaded.bind(this));
    EventHandler.addEventListener(AppEvents.FEATURE_ASSETS_LOADED, this.onFeatureAssetsLoaded.bind(this));
    EventHandler.addEventListener(AppEvents.ON_UPDATE, this.onUpdate.bind(this));
  }

  protected onSecondaryAssetsLoaded(): void {
    if (this.configData.requiredBundle === LOAD_CONSTANTS.SECONDARY) {
      this.createLazyView();
    }
  }
  protected onFeatureAssetsLoaded(): void {
    if (this.configData.requiredBundle === LOAD_CONSTANTS.FEATURES) {
      this.createLazyView();
    }
  }
  public setViewState(flag: boolean): void {
    this.interactive = flag;
    this.interactiveChildren = flag;
  }

  async unloadBundle() {
    if (this.configData.requiredBundle && this.configData.unloadAssets) {
      await AssetLoader.unloadBundle(this.configData.requiredBundle);
    }
  }

  async createLazyView() {
    if (this.configData.requiredBundle) {
      await AssetLoader.loadBundles(this.configData.requiredBundle);
    }
    this.createView();
  }

  protected createView() {
    this.elementsList = [];
    if (this.configData.Elements) {
      this.createElements(this.configData.Elements);
    }
    this.onViewCreated();
    this.viewCreated = true;
    this.isDestroyed = false;
  }
  protected onViewCreated() {}

  protected onUpdate(delta: number) {}

  createElements(data: any, isSecondary = false): void {
    const len = data.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const obj = data[k];
        if (DeviceProxy.config.isDevice) {
          if (obj.isDesktopOnly) {
            continue;
          }
        }
        if (DeviceProxy.config.isDesktop) {
          if (obj.isMobileOnly) {
            continue;
          }
        }
        const element = UIUtil.getElement(obj);
        this.elementsList[obj.name] = element;
        if (obj.name == 'modalRect' || obj.isModalRect) {
          UIUtil.setModalState(element);
        }
        this.addChild(element);
        if (!obj.isInteractive) {
          // element.interactive = false;
          // element.interactiveChildren = false;
        }
      }
    }
    this.guideRect = this.elementsList['guideRect'];
  }
  protected addToElementList(view: any): void {
    this.elementsList[view.configData.name] = view;
  }

  public getWidth(): number {
    if (this.elementsList && this.elementsList['guideRect']) {
      return this.elementsList['guideRect'].width * this.scale.x;
    } else {
      return this.width;
    }
  }
  public getHeight(): number {
    if (this.elementsList && this.elementsList['guideRect']) {
      return this.elementsList['guideRect'].height * this.scale.y;
    } else {
      return this.height;
    }
  }
  getConfigData() {
    return this.configData;
  }
  getLayoutData() {
    return this.configData.layoutData;
  }

  get configData(): any {
    return this._configData;
  }

  set configData(value: any) {
    this._configData = value;
  }
  public async destroyElements(): Promise<void> {
    this?.removeChildren().forEach((child: PixView) => {
      AnimationProxy.killTweensOf(child);
      if (child.destroyElements) {
        child.destroyElements();
      }
      child?.destroy(!!child?.configData?.dontDestroyOnHide);
    });
    AnimationProxy.killTweensOf(this);
    this.isDestroyed = true;
    if (this.configData.unloadAssets) {
      await this.unloadBundle();
      this.destroy();
    }
    this.isDestroyed = true;
    this.viewCreated = false;
  }

  public destroyView(): void {
    this?.removeChildren().forEach((child) => {
      AnimationProxy.killTweensOf(child);
      child?.destroy();
    });
    AnimationProxy.killTweensOf(this);
    this.isDestroyed = true;
    this?.destroy();
  }
}
