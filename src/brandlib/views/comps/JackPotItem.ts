import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class JackPotItem extends StandardView {
  private readonly jackpotBg: PixSpine;
  private readonly value: PixText;
  private readonly counter = { current: 0 };
  private readonly valueQueue: number[] = [];
  private tweenDuration: number;
  private isTweening: boolean = false;
  private tween = null;
  constructor(config) {
    super(config);
    this.jackpotBg = this.elementsList['jackpotBg'];
    this.value = this.elementsList['value'];
  }
  public initialView({ skinName, colorcode }) {
    this.jackpotBg.setSkin(skinName);
    UIUtil.updateTextColor(this.value, colorcode);
  }
  public changeAnimation({ state, loop }) {
    this.jackpotBg.playAnimation({ state, loop, reset: false });
  }
  public setValue(value: number, showValue = false) {
    this.tween?.kill();
    AnimationProxy.killTweensOf(this.counter);
    if (showValue) {
      this.counter.current = value;
      this.updateJackpotValue(value);
    } else {
      this.tweenToValue(value, 0.9);
    }
  }
  public tweenToValue(value: number, duration: number) {
    this.tweenDuration = duration;
    this.valueQueue.push(value);
    this.processValueQueue();
  }
  private processValueQueue() {
    if (this.isTweening || this.valueQueue.length === 0) {
      return;
    }
    const nextValue = this.valueQueue.shift();
    this.isTweening = true;
    AnimationProxy.killTweensOf(this.counter);
    this.tween?.kill();
    this.tween = AnimationProxy.animateTween(this.counter, {
      current: nextValue,
      delay: 0.2,
      duration: this.tweenDuration,
      ease: 'none',
      onUpdate: () => this.updateJackpotValue(this.counter.current),
      onComplete: () => {
        this.isTweening = false;
        this.processValueQueue();
      },
    });
  }
  public updateJackpotValue(value: number) {
    this.value.text = Util.formatCurrency(value);
    this.adjustTextSize();
  }
  public adjustTextSize() {
    const fontSize = this.value.configData.style.fontSize;
    this.value.style.fontSize = fontSize;
    if (this.value.width > this.value.configData.maxWidth) {
      const sc = (this.value.configData.maxWidth * 0.96) / this.value.width;
      this.value.style.fontSize = sc * fontSize;
    }
  }
}
