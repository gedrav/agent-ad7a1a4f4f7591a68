import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';

export class JackPotItem extends StandardView {
  private readonly jackpotBg: PixSpine;
  private readonly txtRect: PixGraphics;
  private readonly value: PixText;
  private readonly currentValue: number = 1000;
  private readonly stackJackpotValues: number[] = [];
  private isCountingUp: boolean = false;
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
  public stackJackpotValue(value: number) {
    this.stackJackpotValues.push(value);
    this.processJackpotQueue();
  }
  private processJackpotQueue() {
    if (this.isCountingUp || this.stackJackpotValues.length === 0) {
      return;
    }
    const nextValue = this.stackJackpotValues.shift();
    this.isCountingUp = true;
    AnimationProxy.animateTween(this, {
      currentValue: nextValue,
      delay: 0.3,
      duration: 1.5,
      onUpdate: this.updateJackpotText.bind(this),
      onComplete: this.onScoreDone.bind(this),
    });
    this.adjustTextSize();
  }
  private onScoreDone() {
    this.isCountingUp = false;
    this.processJackpotQueue();
  }
  private updateJackpotText() {
    this.value.text = Util.formatCurrency(this.currentValue);
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
