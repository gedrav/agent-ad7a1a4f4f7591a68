import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { Clock } from '@core/utils/Clock';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';

export class ReelTickerComp extends StandardView {
  private tickerText1: PixText;
  private tickerText2: PixText;
  private winText: PixText;
  protected tickerIndex: number;
  private bg: any;
  private timeoutId: any;
  private textIndex: number;
  private delayDuration: number;
  private totalWin: number;
  constructor(config) {
    super(config);
    this.bg = this.elementsList['bg'];
    this.elementsList['textCont'].mask = this.elementsList['maskRect'];
    this.tickerText1 = this.elementsList['textCont'].elementsList['tickerText1'];
    this.tickerText2 = this.elementsList['textCont'].elementsList['tickerText2'];
    this.winText = this.elementsList['textCont'].elementsList['winText'];
    this.tickerIndex = 0;
    this.delayDuration = this.configData.tickerDelay ? this.configData.tickerDelay : 8000;
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.onSpinStart.bind(this));
    EventHandler.addEventListener(SlotEvents.IDLE_STATE_ENTRY, this.onSpinEnd.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.showSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.clearSpinWin.bind(this));
    this.tickerText1.x = this.bg.width / 2;
    this.tickerText2.x = this.bg.width / 2;
    this.winText.x = this.bg.width / 2;
    this.winText.y = this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0);
    this.showFirstTicker();
  }
  protected showSpinWin(): void {
    this.tickerText1.visible = this.tickerText2.visible = false;
    this.totalWin += appModel.getSpinWin();
    this.winText.text = Util.getContent('totalWin') + ': ' + Util.formatCurrency(this.totalWin);
    this.winText.visible = true;
    AnimationProxy.animateTween(this.winText, {
      duration: 0.25,
      scaleX: 1.1,
      scaleY: 1.1,
      ease: 'easeInOut',
      repeat: 3,
      yoyo: true,
    });
  }
  protected clearSpinWin(): void {
    clearTimeout(this.timeoutId);
    this.tickerText1.visible = this.tickerText2.visible = true;
    this.winText.visible = false;
    AnimationProxy.killTweensOf(this.winText);
    this.winText.scale.set(1, 1);
    this.totalWin = 0;
  }
  protected onSpinStart(): void {
    clearTimeout(this.timeoutId);
    const duration = 0.2;
    if (this.textIndex == 1) {
      AnimationProxy.animateTween(this.tickerText1, {
        duration: duration,
        y: this.bg.height + this.tickerText1.height,
      });
      const index = Util.getRandomRange(1, 2);
      this.tickerText2.text = Util.getContent('SpinTimeTicker' + index);
      this.tickerText2.y = -this.tickerText2.height;
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0),
      });
      this.textIndex = 2;
    } else {
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height + this.tickerText2.height,
      });
      const index = Util.getRandomRange(1, 2);
      this.tickerText1.text = Util.getContent('SpinTimeTicker' + index);
      this.tickerText1.y = -this.tickerText2.height;
      AnimationProxy.animateTween(this.tickerText1, {
        duration: duration,
        y: this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0),
      });
      this.textIndex = 1;
    }
  }
  protected onSpinEnd(): void {
    if (this.totalWin > 0) {
      return;
    }
    this.changeTicker();
  }
  protected showFirstTicker() {
    this.textIndex = 1;
    this.tickerText1.text = Util.getContent(this.configData.content[this.tickerIndex]);
    this.tickerText1.y = this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0);
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.changeTicker.bind(this), this.delayDuration);
  }

  protected changeTicker(): void {
    const duration = 0.4;
    if (this.tickerIndex == this.configData.content.length - 1) {
      this.tickerIndex = 0;
    } else {
      this.tickerIndex++;
    }
    if (this.textIndex == 1) {
      AnimationProxy.animateTween(this.tickerText1, {
        duration: duration,
        y: this.bg.height + this.tickerText1.height * 0.25,
      });

      this.tickerText2.text = Util.getContent(this.configData.content[this.tickerIndex]);
      this.tickerText2.y = -this.tickerText2.height;
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0),
      });
      this.textIndex = 2;
    } else {
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height + this.tickerText2.height * 0.25,
      });
      this.tickerText1.text = Util.getContent(this.configData.content[this.tickerIndex]);
      this.tickerText1.y = -this.tickerText2.height;
      AnimationProxy.animateTween(this.tickerText1, {
        duration: duration,
        y: this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0),
      });
      this.textIndex = 1;
    }
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.changeTicker.bind(this), this.delayDuration);
  }
}
