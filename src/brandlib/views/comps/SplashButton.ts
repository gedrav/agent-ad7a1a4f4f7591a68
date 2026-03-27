import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';

export class SplashButton extends ResponsiveChildrenView {
  private btn: PixToggleButton;
  private text: PixText;

  constructor(config) {
    super(config);
    const gr = UIUtil.getRectangle(548, 90, 0xff0000);
    this.addChild(gr);
    gr.alpha = 0;
    this.btn = UIUtil.getElement(this.configData.btnConfig);
    this.btn.x = this.btn.width * 0.5;
    this.btn.y = this.btn.height * 0.5;
    this.text = UIUtil.getText(this.configData.textConfig);
    this.text.x = this.btn.x + this.btn.width * 0.6;
    this.text.y = this.btn.y * 0.5;
    this.addChild(this.btn, this.text);
    gr.width = this.text.x + this.text.width;
  }

  setSelected(flag: boolean) {
    this.btn.setSelected(flag);
  }

  public isSelected(): boolean {
    return this.btn.isSelected;
  }

  public setText(text: string) {
    this.text.text = text;
  }

  public addInteraction(cb: any) {
    this.btn.onPress.connect(cb);
  }
}
