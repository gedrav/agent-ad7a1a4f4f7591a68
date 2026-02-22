import * as PIXI from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { AssetLoader } from '@core/models/services/AssetLoader';
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
      }
    } else {
      if (this.configData.dontCreateView) {
        return;
      }
      this.createView();
    }

    EventHandler.addEventListener(AppEvents.ON_UPDATE, this.onUpdate.bind(this));
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
  }
  protected onViewCreated() {}

  protected onUpdate(delta: number) {}

  createElements(data: any, isSecondary = false): void {
    const len = data.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const obj = data[k];
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
      child?.destroy(!!child.configData.dontDestroyOnHide);
    });
    AnimationProxy.killTweensOf(this);
    this.isDestroyed = true;
    if (this.configData.unloadAssets) {
      await this.unloadBundle();
      this.destroy();
    }
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
