import { StandardView } from '@core/pixiwrapper/StandardView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { WinTicker } from '@core/views/comps/WinTicker';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

export class ReelWinTicker extends StandardView {
  protected winTicker: WinTicker;
  protected totalWin: number;

  constructor(config) {
    super(config);
    //this.visible = false;
    this.winTicker = this.elementsList['winTicker'];
    EventHandler.addEventListener(SlotEvents.SHOW_REELTICKER_WIN, this.showSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SKIP_REELTICKER_WIN, this.skipToFinalValue.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.clearSpinWin.bind(this));
  }
  //removed skip event listener, if needed then exrend the class}
  protected showSpinWin(data: any): void {
    if (this.totalWin == 0) {
      AnimationProxy.fadeIn(this.winTicker, 0.25);
      this.winTicker.reset();
    }
    this.totalWin += data.value;
    if (data.duration == 0) {
      this.winTicker.showSpinValue(this.totalWin, true);
    } else {
      this.winTicker.countUpValue(this.totalWin, data.duration, true);
    }

    this.visible = true;
  }
  protected skipToFinalValue(): void {
    this.winTicker.skipToFinalValue();
  }
  protected clearSpinWin(): void {
    this.visible = false;
    this.totalWin = 0;
  }
}
