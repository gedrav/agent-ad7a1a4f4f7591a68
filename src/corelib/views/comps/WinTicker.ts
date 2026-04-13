import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';

export class WinTicker extends StandardView {
  private valueText: PixText;
  private currentValue: number;
  private targetValue: number;
  private duration: number;
  private startTime: number;
  private startValue: number;
  private tickerActive: boolean;
  private showCurrency: boolean;
  constructor(config) {
    super(config);
    this.valueText = this.elementsList['valueText'];
    this.currentValue = 0;
    this.targetValue = this.currentValue;

    this.duration = 1000; // default 1 second
    this.startTime = null;
    this.startValue = this.currentValue;
    this.tickerActive = false;
  }

  public setPosition(x: number, y: number): void {
    this.valueText.x = x;
    this.valueText.y = y;
  }

  public reset(): void {
    this.tickerActive = false;
    this.valueText.text = '';
    this.currentValue = 0;
  }
  public showSpinValue(newValue: number, showCurrency: boolean = false, showPrefix: boolean = false): void {
    this.visible = true;
    this.showCurrency = showCurrency;
    this.currentValue = newValue;
    this.targetValue = newValue;
    if (this.showCurrency) {
      if (showPrefix) {
        this.valueText.text = Util.getContent('totalWin') + ' ' + Util.formatCurrency(this.currentValue);
      } else {
        this.valueText.text = Util.formatCurrency(this.currentValue);
      }
    } else {
      this.valueText.text = Util.formatCurrencyNoSymbol(this.currentValue);
    }
  }

  public countUpValue(newValue: number, duration: number = 2000, showCurrency: boolean = false): void {
    this.visible = true;
    this.showCurrency = showCurrency;
    this.targetValue = newValue;
    this.duration = duration;
    this.startTime = null;
    this.startValue = this.currentValue;

    if (!this.tickerActive) {
      this.tickerActive = true;
      requestAnimationFrame(this.update.bind(this));
    }
  }

  public skipToFinalValue(): void {
    if (this.showCurrency) {
      this.valueText.text = Util.formatCurrency(this.targetValue);
    } else {
      this.valueText.text = Util.formatCurrencyNoSymbol(this.targetValue);
    }
    this.tickerActive = false;
  }

  protected update(timestamp) {
    if (this.startTime === null) this.startTime = timestamp;
    if (!this.tickerActive) {
      return;
    }

    const progress = (timestamp - this.startTime) / this.duration;
    const clamped = Math.min(progress, 1);

    this.currentValue = this.startValue + (this.targetValue - this.startValue) * clamped;

    // update text display
    if (this.showCurrency) {
      this.valueText.text = Util.formatCurrency(this.currentValue);
    } else {
      this.valueText.text = Util.formatCurrencyNoSymbol(this.currentValue);
    }

    if (clamped < 1) {
      if (this.tickerActive) {
        requestAnimationFrame(this.update.bind(this));
      }
    } else {
      this.tickerActive = false;
      this.emit('COUNTUP_COMPLETED');
    }
  }
}
