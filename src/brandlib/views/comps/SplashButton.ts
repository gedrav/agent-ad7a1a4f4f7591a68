import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class SplashButton extends ResponsiveChildrenView {
  private btn: PixFancyButton;
  private icon: PixSprite;
  private text: PixText;
  private icon2: PixSprite;

  constructor(config) {
    super(config);

    this.btn = UIUtil.getFancyButton(this.configData.btnConfig);
    this.icon = UIUtil.getSprite(this.configData.icon);
    if (this.configData.icon2) {
      this.icon2 = UIUtil.getSprite(this.configData.icon2);
    }
    if (this.icon2) {
      this.icon2.scale.set(0.6);
    }

    this.text = UIUtil.getText(this.configData.textConfig);
    if (this.icon2) {
      this.addChild(this.btn, this.icon, this.icon2, this.text);
    } else {
      this.addChild(this.btn, this.icon, this.text);
    }

    this.btn.anchor.set(0, 0);
  }

  public addInteraction(cb: any) {
    this.btn.onPress.connect(cb);
  }

  protected resizeView() {
    super.resizeView();
    if (this.isDestroyed) return;
    this.btn.height = 100;
    this.btn.width = this.text.x + this.text.width;
    this.icon.scale.set(1);
    const sc = (this.btn.height * 0.5) / this.icon.height;
    this.icon.scale.set(sc);
    this.text.scale.set(sc);
    this.icon.x = this.btn.width * 0.02;
    this.text.x = this.icon.x + this.icon.width + this.btn.width * 0.05;
    this.icon.y = (this.btn.height - this.icon.height) / 2;
    this.text.y = (this.btn.height - this.text.height) / 2;
    if (this.icon2) {
      this.icon2.x = this.icon.x + (this.icon.width - this.icon2.width) * 0.5;
      this.icon2.y = this.icon.y + (this.icon.height - this.icon2.height) * 0.5;
    }
  }
}
