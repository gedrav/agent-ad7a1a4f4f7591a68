import { BuyBonusView } from '@brand/views/popups/BuyBonusView';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { UIUtil } from '@core/utils/UIUtilService';

export class BuyBonusViewMobile extends BuyBonusView {
  private topbar: PixGraphics;
  private closeBtn: PixFancyButton;

  constructor(config: any) {
    super(config);
    this.topbar = this.elementsList['topbar'];
    this.closeBtn = this.elementsList['elementsContainer'].elementsList['closeBtn'];
    if (this.closeBtn) {
      this.closeBtn.onPress.connect(this.closeBuyBonus.bind(this));
    }
  }
  protected closeBuyBonus() {}

  protected resizeView() {
    super.resizeView();
    if (DeviceProxy.config.isLandscape) {
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
    }
  }
}
