import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';

export class SplashButton extends ResponsiveChildrenView {
  private btn: PixToggleButton;
  private text: PixText;
  private invisBtn: PixFancyButton;

  constructor(config) {
    super(config);
    const btnconfig = {
      name: 'transBtn',
      type: 'Button',
      options: {
        defaultView: 'transRect',
        hoverView: 'transRect',
        pressedView: 'transRect',
        disabledView: 'transRect',
      },
    };
    this.invisBtn = UIUtil.getElement(btnconfig);
    this.invisBtn.anchor.set(0, 0);
    this.invisBtn.onPress.connect(() => {
      this.emit('BUTTON_PRESSED');
    });
    this.addChild(this.invisBtn);
    this.invisBtn.alpha = 0;
    this.btn = UIUtil.getElement(this.configData.btnConfig);
    this.btn.x = this.btn.width * 0.5;
    this.btn.y = this.btn.height * 0.5;
    this.text = UIUtil.getText(this.configData.textConfig);
    this.text.x = this.btn.x + this.btn.width * 0.6;
    this.text.y = this.btn.y * 0.5;
    this.addChild(this.btn, this.text);
    this.invisBtn.width = this.text.x + this.text.width;
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
