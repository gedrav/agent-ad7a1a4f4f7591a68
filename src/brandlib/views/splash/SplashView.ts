import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { SplashItemComp } from '@brand/views/splash/SplashItemComp';
import { PixView } from '@core/pixiwrapper/PixView';
import { DualSprite } from '@core/pixiwrapper/DualSprite';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { AppEvents } from '@core/events/AppEvents';
import { Util } from '@core/utils/UtilService';
import { SplashStartCommand } from '@core/commands/action/SplashStartCommand';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { SlotEvents } from '@core/events/SlotEvents';
import * as PIXI from 'pixi.js';
import { appModel } from '@core/models/services/AppModelService';

export class SplashView extends ResponsesiveChildrenView {
  private gameTitle: PixSprite | PixSpine;
  private itemsArray: SplashItemComp[];
  private itemContainer: PixView;
  public assetBundles = ['SPLASH'];
  private splashBG: DualSprite;
  private loadingBtnContainer: PixView;
  private loaderbg: PixSprite;
  private loadingText: any;
  private maskRect: any;
  private startBtn: PixFancyButton;
  private loaderfill: PixSprite;
  constructor(config: any) {
    super(config);
    this.gameTitle = this.elementsList['gameTitle'];
    this.splashBG = this.elementsList['splashBG'];
    this.loadingBtnContainer = this.elementsList['loadingBtnContainer'];
    this.loaderbg = this.loadingBtnContainer?.elementsList?.['loaderbg'];
    this.loaderfill = this.loadingBtnContainer?.elementsList?.['loaderfill'];
    this.loadingText = this.loadingBtnContainer?.elementsList?.['loadingText'];
    this.maskRect = this.loadingBtnContainer?.elementsList?.['maskRect'];

    if (this.loaderbg) {
      const flt = new PIXI.ColorMatrixFilter();
      flt.greyscale(0.4, true);
      this.loaderbg.filters = [flt];
    }

    this.startBtn = this.loadingBtnContainer?.elementsList?.['startBtn'];
    if (this.startBtn) {
      this.startBtn.visible = false;
    }

    if (this.maskRect) {
      this.loaderfill.mask = this.maskRect;
      this.maskRect.scale.x = 0;
    }

    this.itemsArray = [];
    this.itemContainer = UIUtil.getContainer();
    this.addChild(this.itemContainer);

    const len = this.configData.contents?.length || 0;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        const item = new SplashItemComp(this.configData.contents[k]);
        this.itemContainer.addChild(item);
        this.itemsArray.push(item);
      }
    }
    this.resizeView();
    EventHandler.addEventListener(AppEvents.PRIMARY_ASSETS_LOADED, this.onPrimaryAssetsLoaded.bind(this));
    EventHandler.addEventListener(AppEvents.LOAD_PROGRESS, this.onLoadProgress.bind(this));
    if (appModel.primaryAssetsLoaded) {
      this.onPrimaryAssetsLoaded();
    }
  }

  protected onLoadProgress(loaded: number): void {
    if (loaded) {
      if (this.loadingText && this.loadingText.text !== undefined) {
        this.loadingText.text = Util.getContent('loadingText', [loaded]);
      }
      if (this.maskRect) {
        this.maskRect.scale.x = loaded / 100;
      }
    }
  }

  protected onPrimaryAssetsLoaded(): void {
    if (this.loadingText) {
      this.loadingText.text = Util.getContent('startGameText');
      this.loaderbg.visible = false;
      this.loaderfill.visible = false;
      this.startBtn.visible = true;
      this.loadingBtnContainer.removeChild(this.maskRect);
      //this.startBtn.click();
    }
  }
  protected positionElements(): void {
    this.guideRect.y = this.gameTitle?.y + this.gameTitle?.height + UIUtil.getGameHeight() * 0.02;
    this.loadingBtnContainer.x = UIUtil.getGameWidth() / 2;
    this.loadingBtnContainer.y = UIUtil.getGameHeight() * 0.93;

    if (DeviceProxy.config.isPortrait) {
      this.guideRect.width = UIUtil.getGameWidth() * 0.96;
      this.guideRect.height =
        UIUtil.getGameHeight() - this.guideRect.y - UIUtil.getGameHeight() * 0.1 - UIUtil.getGameHeight() * 0.02;
    } else {
      this.guideRect.width = UIUtil.getGameWidth() * 0.96;
      this.guideRect.height =
        UIUtil.getGameHeight() - this.guideRect.y - UIUtil.getGameHeight() * 0.16 - UIUtil.getGameHeight() * 0.02;
    }
    this.guideRect.x = (UIUtil.getGameWidth() - this.guideRect.width) / 2;
    if (DeviceProxy.config.isPortrait) {
      this.alignForPortrait();
    } else {
      this.alignForLandscape();
    }
  }

  protected alignForPortrait(): void {
    const len = this.itemsArray.length;
    if (len > 0) {
      for (const item of this.itemsArray) {
        item.x = 0;
        item.y = 0;
      }
      if (len === 2) {
        for (let k = 0; k < len; k++) {
          this.itemsArray[k].x = 0;
          this.itemsArray[k].y =
            k === 0 ? 0 : this.itemsArray[k - 1].y + this.itemsArray[k - 1].height + UIUtil.getGameHeight() * 0.02;
        }
      } else {
        const colGap = UIUtil.getGameWidth() * 0.05;
        const rowGap = UIUtil.getGameHeight() * 0.02;
        let colWidth = 0;
        const rowHeights: number[] = [];

        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];
          colWidth = Math.max(colWidth, item1.width);
          if (item2) colWidth = Math.max(colWidth, item2.width);
        }

        let yOffset = 0;
        for (let i = 0; i < len; i += 2) {
          const item1 = this.itemsArray[i];
          const item2 = this.itemsArray[i + 1];

          if (!item2 && len % 2 !== 0) {
            item1.x = colWidth + colGap / 2 - item1.width / 2;
            item1.y = yOffset;
          } else {
            item1.x = 0;
            item1.y = yOffset;

            item2.x = colWidth + colGap;
            item2.y = yOffset;

            const rowHeight = Math.max(item1.height, item2.height);
            yOffset += rowHeight + rowGap;
          }
        }
      }

      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc));

      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
      this.gameTitle.y = this.itemContainer.y - this.gameTitle.height * 1.2;
    }
  }

  protected alignForLandscape(): void {
    // this.loadingBtn.scale.set(1);
    const len = this.itemsArray.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        this.itemsArray[k].y = 0;
        this.itemsArray[k].x =
          k == 0 ? 0 : this.itemsArray[k - 1].x + this.itemsArray[k - 1].width + UIUtil.getGameHeight() * 0.02;
      }
      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc, 1));
      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
      if (this.gameTitle) {
        this.gameTitle.y = this.itemContainer.y - this.gameTitle?.height * 1.06;
      }
    }
  }

  protected resizeView(): void {
    if (this.isDestroyed) {
      return;
    }
    super.resizeView();
    this.positionElements();
  }

  public removeSplash(): void {
    //AnimationProxy.animateTween(this, 0.5, {alpha: 0, onComplete: this.onFadedOut.bind(this)});
    this.onFadedOut();
  }
  protected async onFadedOut() {
    await this.destroyElements();
    EventHandler.dispatchEvent(SlotEvents.SPLASH_DESTROYED);
  }
}
