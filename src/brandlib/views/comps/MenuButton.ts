import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class MenuButton extends ResponsiveChildrenView {
  private btn: PixFancyButton;
  private icon: PixSprite;
  private text: PixText;

  constructor(config) {
    super(config);

    this.btn = UIUtil.getFancyButton(this.configData.btnConfig);
    this.icon = UIUtil.getSprite(this.configData.icon);
    this.text = UIUtil.getText(this.configData.textConfig);
    this.addChild(this.btn, this.icon, this.text);
    this.btn.anchor.set(0, 0);
  }

  protected resizeView() {
    super.resizeView();
    if (DeviceProxy.config.isLandscape) {
      this.btn.height = UIUtil.getGameHeight() * 0.12;
    } else {
      this.btn.height = UIUtil.getGameHeight() * 0.06;
    }

    this.btn.width = UIUtil.getGameWidth();
    this.icon.scale.set(1);
    const sc = (this.btn.height * 0.5) / this.icon.height;
    this.icon.scale.set(sc);
    this.text.scale.set(sc);
    this.icon.x = this.btn.width * 0.02;
    this.text.x = this.icon.x + this.icon.width + this.btn.width * (DeviceProxy.config.isLandscape ? 0.01 : 0.02);
    this.icon.y = (this.btn.height - this.icon.height) / 2;
    this.text.y = (this.btn.height - this.text.height) / 2;
  }
}
