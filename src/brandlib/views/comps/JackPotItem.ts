import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class JackPotItem extends StandardView {
  private readonly jackpotBg: PixSpine;
  private readonly txtRect: PixGraphics;
  private readonly value: PixText;
  private readonly counter = { current: 0 };
  constructor(config) {
    super(config);
    this.jackpotBg = this.elementsList['jackpotBg'];
    this.txtRect = this.elementsList['txtRect'];
    this.value = this.elementsList['value'];
  }
  public initialView({ skinName, colorcode }) {
    this.jackpotBg.setSkin(skinName);
    UIUtil.updateTextColor(this.value, colorcode);
  }
  public changeAnimation({ state, loop }) {
    this.jackpotBg.playAnimation({ state, loop, reset: false });
  }
  public setValue(value: number) {
    AnimationProxy.killTweensOf(this.counter);
    this.counter.current = value;
    this.updateJackpotValue(value);
  }
  public tweenToValue(value: number, duration: number) {
    AnimationProxy.animateTween(this.counter, {
      current: value,
      duration,
      ease: 'none',
      onUpdate: () => this.updateJackpotValue(this.counter.current),
    });
  }
  public updateJackpotValue(value: number) {
    this.value.text = Util.formatCurrency(value);
    this.adjustTextSize();
  }
  public adjustTextSize() {
    const fontSize = this.value.configData.style.fontSize;
    this.value.style.fontSize = fontSize;
    if (this.value.width > this.txtRect.width) {
      const sc = (this.txtRect.width * 0.96) / this.value.width;
      this.value.style.fontSize = sc * fontSize;
    }
  }
}
