import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
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

export class SplashView extends ResponsiveChildrenView {
  private gameTitle: PixSprite | PixSpine;
  private itemsArray: SplashItemComp[];
  private itemContainer: PixView;
  private startBtn: PixFancyButton;
  constructor(config: any) {
    super(config);
    this.gameTitle = this.elementsList['gameTitle'];
    this.startBtn = this.elementsList?.['startBtn'];
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
    /*setTimeout(() => {
      this.startBtn.click();
    }, 500);*/
  }

  protected positionElements(): void {
    if (DeviceProxy.config.isDesktop) {
      this.guideRect.width = UIUtil.getGameWidth() * 0.96;
      this.guideRect.height = UIUtil.getGameHeight() * 0.4;

      this.guideRect.x = (UIUtil.getGameWidth() - this.guideRect.width) / 2;
      this.guideRect.y = UIUtil.getGameHeight() * 0.45 - this.guideRect.height / 2;

      this.gameTitle.x = UIUtil.getGameWidth() * 0.5;
      this.gameTitle.y = UIUtil.getGameHeight() * 0.1;
    } else {
      if (DeviceProxy.config.isPortrait) {
        this.guideRect.width = UIUtil.getGameWidth() * 0.9;
        this.guideRect.height = UIUtil.getGameHeight() * 0.6;

        this.guideRect.x = (UIUtil.getGameWidth() - this.guideRect.width) / 2;
        this.guideRect.y = UIUtil.getGameHeight() * 0.45 - this.guideRect.height / 2;
        this.gameTitle.x = UIUtil.getGameWidth() * 0.5;
        this.gameTitle.y = UIUtil.getGameHeight() * 0.1;
      } else {
        this.guideRect.width = UIUtil.getGameWidth() * 0.6;
        this.guideRect.height = UIUtil.getGameHeight() * 0.8;

        this.guideRect.x = UIUtil.getGameWidth() * 0.02;
        this.guideRect.y = UIUtil.getGameHeight() * 0.5 - this.guideRect.height / 2;

        this.gameTitle.scale.set(1);
        const availableWidth = UIUtil.getGameWidth() - this.guideRect.x - this.guideRect.width;
        const sc = (availableWidth * 0.7) / this.gameTitle.width;
        this.gameTitle.scale.set(sc);
        this.gameTitle.x =
          this.guideRect.x +
          this.guideRect.width +
          (UIUtil.getGameWidth() - this.guideRect.x - this.guideRect.width) * 0.5;
        this.gameTitle.y = this.guideRect.y + this.gameTitle.height * 0.5;
      }
    }

    this.startBtn.scale.set(1);
    if (DeviceProxy.config.isPortrait) {
      this.alignForPortrait();
      UIUtil.setPercentageScale(this.startBtn, 0.5, 1, 1);
      this.startBtn.x = UIUtil.getGameWidth() * 0.5;
      this.startBtn.y = this.itemContainer.y + this.itemContainer.height + UIUtil.getGameHeight() * 0.1;
    } else {
      if (DeviceProxy.config.isDesktop) {
        this.alignForDesktop();
        this.startBtn.x = UIUtil.getGameWidth() * 0.5;
        this.startBtn.y = this.itemContainer.y + this.itemContainer.height + UIUtil.getGameHeight() * 0.1;
      } else {
        this.alignForLandscape();
        UIUtil.setPercentageScale(this.startBtn, 0.3, 1, 1);
        this.startBtn.x = this.gameTitle.x;
        this.startBtn.y = this.guideRect.y + this.guideRect.height * 0.5;
      }
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
    }
  }

  protected alignForLandscape(): void {
    // this.loadingBtn.scale.set(1);
    const len = this.itemsArray.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        this.itemsArray[k].x = 0;
        this.itemsArray[k].y =
          k == 0 ? 0 : this.itemsArray[k - 1].y + this.itemsArray[k - 1].height + UIUtil.getGameHeight() * 0.02;
      }
      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc, 1));
      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
    }
  }
  protected alignForDesktop(): void {
    // this.loadingBtn.scale.set(1);
    const len = this.itemsArray.length;
    if (len > 0) {
      for (let k = 0; k < len; k++) {
        this.itemsArray[k].x =
          k == 0 ? 0 : this.itemsArray[k - 1].x + this.itemsArray[k - 1].width + UIUtil.getGameWidth() * 0.02;
        this.itemsArray[k].y = 0;
      }
      this.itemContainer.scale.set(1);
      const sc = this.guideRect.width / this.itemContainer.width;
      const hsc = this.guideRect.height / this.itemContainer.height;
      this.itemContainer.scale.set(Math.min(sc, hsc, 1));
      this.itemContainer.x = this.guideRect.x + (this.guideRect.width - this.itemContainer.width) / 2;
      this.itemContainer.y = this.guideRect.y + (this.guideRect.height - this.itemContainer.height) / 2;
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
