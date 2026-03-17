import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { Sine } from 'gsap/gsap-core';

export class BuyBonusViewMobile extends BuyBonusView {
  private topbar: PixGraphics;
  private closeBtn: PixFancyButton;

  constructor(config: any) {
    super(config);
    this.buyBonusBg = this.elementsList['buyBonusBg'];
    this.topbar = this.elementsList['topbar'];
    this.closeBtn = this.elementsList['closeBtn'];
    if (this.closeBtn) {
      console.log('closeBtn', this.closeBtn);
      this.closeBtn.onPress.connect(this.closeBuyBonus.bind(this));
    }
  }

  protected async showBuyBonusView() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW, 0);
    this.x = -this.width;
    this.alpha = 1;
    this.visible = true;
    AnimationProxy.animateTween(this, { duration: 0.2, x: 0, ease: Sine.easeOut });
  }
  protected resizeView() {
    this.buyBonusBg.scale.set(1);
    this.buyBonusBg.height = UIUtil.getGameHeight();

    super.resizeView();
    /*if (DeviceProxy.config.isLandscape) {
      this.splashImage.scale.set(1);
      const sc: number = (this.buyBonusBg.width * 0.4) / this.splashImage.width;
      this.splashImage.scale.set(sc);
      this.splashImage.x = 0;
      this.splashImage.y = 0;

      this.titleText.x = this.splashImage.x + this.splashImage.width + this.buyBonusBg.width * 0.15;
      this.titleText.y = this.splashImage.y + this.splashImage.height * 0.3;

      this.buyFreeSpinsValueText.x = this.titleText.x;
      this.buyFreeSpinsValueText.y = this.splashImage.y + this.splashImage.height * 0.6;

      this.startBtn.scale.set(1);
      const sc2: number = (this.buyBonusBg.width * 0.16) / this.startBtn.width;
      this.startBtn.scale.set(sc2);
      this.cancelBtn.scale.set(sc2);

      this.startBtn.x =
        (this.titleText.x + this.titleText.width * 0.5) * 0.5 + this.buyBonusBg.width * 0.01 + this.startBtn.width / 2;
      this.cancelBtn.x =
        (this.titleText.x + this.titleText.width * 0.5) * 0.5 - this.buyBonusBg.width * 0.01 - this.cancelBtn.width / 2;
      this.startBtn.y = this.splashImage.y + this.splashImage.height * 1.25;
      this.cancelBtn.y = this.startBtn.y;

      this.elementsContainer.x = (this.buyBonusBg.width - this.elementsContainer.width) * 0.5;
      this.elementsContainer.y = (this.buyBonusBg.height - this.elementsContainer.height) * 0.6;
    } else {
      this.splashImage.scale.set(1);
      const sc: number = (this.buyBonusBg.width * 0.8) / this.splashImage.width;
      this.splashImage.scale.set(sc);
      this.splashImage.x = 0;
      this.splashImage.y = 0;

      this.titleText.x = this.splashImage.width / 2;
      this.titleText.y = this.splashImage.y + this.splashImage.height + this.buyBonusBg.height * 0.05;

      this.buyFreeSpinsValueText.x = this.splashImage.width / 2;
      this.buyFreeSpinsValueText.y = this.titleText.y + this.titleText.height * 0.5 + this.buyBonusBg.height * 0.05;

      this.startBtn.scale.set(1);
      const sc2: number = (this.buyBonusBg.width * 0.32) / this.startBtn.width;
      this.startBtn.scale.set(sc2);
      this.cancelBtn.scale.set(sc2);

      this.startBtn.x = this.splashImage.width / 2 + this.startBtn.width / 2 + UIUtil.getGameWidth() * 0.01;
      this.cancelBtn.x = this.splashImage.width / 2 - this.cancelBtn.width / 2 - UIUtil.getGameWidth() * 0.01;
      this.startBtn.y =
        this.buyFreeSpinsValueText.y + this.buyFreeSpinsValueText.height * 0.5 + this.buyBonusBg.height * 0.08;
      this.cancelBtn.y = this.startBtn.y;

      this.elementsContainer.x = (this.buyBonusBg.width - this.elementsContainer.width) * 0.5;
      this.elementsContainer.y = this.topbar.height + this.buyBonusBg.height * 0.05;
    }*/
  }
  protected closeBuyBonus(): void {
    AnimationProxy.animateTween(this, { duration: 0.2, x: -this.width, onComplete: this.onBBHidden.bind(this) });
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
  }
  protected onBBHidden(): void {
    EventHandler.dispatchEvent(SlotEvents.HIDE_BUY_BONUS_VIEW);
  }
}
