import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixText } from '@core/pixiwrapper/PixText';

export class TimerView extends ResponsiveView {
  private readonly clockText: PixText;
  private clockIntervalId: any = null;
  constructor(configData: any) {
    super(configData);
    this.clockText = this.elementsList['clockTxt'];
    this.startClock();
  }

  startClock() {
    this.showTime();
    if (this.clockIntervalId !== null) {
      clearInterval(this.clockIntervalId);
    }
    this.clockIntervalId = setInterval(this.showTime.bind(this), 1000);
  }

  public destroyView(): void {
    if (this.clockIntervalId !== null) {
      clearInterval(this.clockIntervalId);
      this.clockIntervalId = null;
    }
    super.destroyView?.();
  }

  showTime() {
    const d = new Date();
    let hr = d.getHours();
    hr = hr > 12 ? hr - 12 : hr;

    const min = d.getMinutes();

    const ampm = d.getHours() < 12 ? 'AM' : 'PM';
    this.clockText.text = this.getTwoDigig(hr) + ':' + this.getTwoDigig(min) + ' ' + ampm;
  }
  protected getTwoDigig(val: number): string {
    return val < 10 ? '0' + val : val.toString();
  }
}
