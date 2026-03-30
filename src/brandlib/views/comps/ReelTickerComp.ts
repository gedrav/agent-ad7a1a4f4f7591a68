import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';

export class ReelTickerComp extends StandardView {
  private tickerText1: PixText;
  private tickerText2: PixText;
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
    this.tickerIndex = 0;

    this.delayDuration = this.configData.tickerDelay ? this.configData.tickerDelay : 8000;
    EventHandler.addEventListener(SlotEvents.START_SPIN, this.onSpinStart.bind(this));
    EventHandler.addEventListener(SlotEvents.IDLE_STATE_ENTRY, this.onSpinEnd.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.clearSpinWin.bind(this));

    EventHandler.addEventListener(SlotEvents.SHOW_REELTICKER_WIN, this.showSpinWin.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.hideTicker.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.showTicker.bind(this));

    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_START, this.hideTicker.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_ENDED, this.showTicker.bind(this));

    this.tickerText1.x = this.bg.width / 2;
    this.tickerText2.x = this.bg.width / 2;
    this.showFirstTicker();
  }

  protected hideTicker(): void {
    this.visible = false;
    console.log('hide ticker');
  }
  protected showTicker(): void {
    this.visible = true;
    console.log('show ticker');
  }

  protected showSpinWin(data: any): void {
    this.tickerText1.visible = this.tickerText2.visible = false;
    this.totalWin += data.value;
  }
  protected clearSpinWin(): void {
    clearTimeout(this.timeoutId);
    this.totalWin = 0;
    this.tickerText1.visible = this.tickerText2.visible = true;
  }
  protected onSpinStart(): void {
    clearTimeout(this.timeoutId);
    const duration = 0.2;
    if (this.textIndex == 1) {
      AnimationProxy.animateTween(this.tickerText1, {
        duration: duration,
        y: this.bg.height * 1.1 + this.tickerText1.height,
      });
      const index = Util.getRandomRange(1, 2);
      this.tickerText2.scale.set(1);
      this.tickerText2.text = Util.getContent('SpinTimeTicker' + index);
      if (this.tickerText2.width > this.bg.width) {
        this.tickerText2.scale.set(this.bg.width / this.tickerText2.width);
      }
      this.tickerText2.y = -this.tickerText2.height;
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0),
      });
      this.textIndex = 2;
    } else {
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height * 1.1 + this.tickerText2.height,
      });
      const index = Util.getRandomRange(1, 2);
      this.tickerText1.scale.set(1);
      this.tickerText1.text = Util.getContent('SpinTimeTicker' + index);
      if (this.tickerText1.width > this.bg.width) {
        this.tickerText1.scale.set(this.bg.width / this.tickerText1.width);
      }
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
    this.tickerText1.scale.set(1);
    this.tickerText1.text = Util.getContent(this.configData.content[this.tickerIndex]);
    if (this.tickerText1.width > this.bg.width) {
      this.tickerText1.scale.set(this.bg.width / this.tickerText1.width);
    }
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
        y: this.bg.height * 1.1 + this.tickerText1.height,
      });
      this.tickerText2.scale.set(1);
      this.tickerText2.text = Util.getContent(this.configData.content[this.tickerIndex]);
      if (this.tickerText2.width > this.bg.width) {
        this.tickerText2.scale.set(this.bg.width / this.tickerText2.width);
      }
      this.tickerText2.y = -this.tickerText2.height;
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height / 2 + Util.getDefaultValue(this.configData.contentYPadding, 0),
      });
      this.textIndex = 2;
    } else {
      AnimationProxy.animateTween(this.tickerText2, {
        duration: duration,
        y: this.bg.height * 1.1 + this.tickerText2.height,
      });
      this.tickerText1.scale.set(1);
      this.tickerText1.text = Util.getContent(this.configData.content[this.tickerIndex]);
      if (this.tickerText1.width > this.bg.width) {
        this.tickerText1.scale.set(this.bg.width / this.tickerText1.width);
      }
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
