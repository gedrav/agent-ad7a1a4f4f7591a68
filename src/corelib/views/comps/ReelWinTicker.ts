import { StandardView } from '@core/pixiwrapper/StandardView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { WinTicker } from '@core/views/comps/WinTicker';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';

export class ReelWinTicker extends StandardView {
  protected winTicker: WinTicker;
  protected totalWin: number;
  private storedData: any;

  constructor(config) {
    super(config);
    //this.visible = false;
    this.winTicker = this.elementsList['winTicker'];
    EventHandler.addEventListener(SlotEvents.SHOW_REELTICKER_WIN, this.showSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.SKIP_REELTICKER_WIN, this.skipToFinalValue.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_ROUND, this.clearSpinWin.bind(this));
    EventHandler.addEventListener(SlotEvents.TOGGLE_REELTICKER_WIN, this.toggleVisibility.bind(this));

    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_STOP, this.onAutoplayEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_FORCE_STOP, this.onAutoplayEnded.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END_FSCOMP, this.onFreeSpinsEnded.bind(this));
  }
  protected onAutoplayEnded(): void {}
  protected onFreeSpinsEnded(): void {}
  protected updateUIForFreeSpinsStart(): void {
    this.visible = false;
  }
  //removed skip event listener, if needed then exrend the class}
  protected showSpinWin(data: any): void {
    this.storedData = data;
    if (this.totalWin == 0) {
      AnimationProxy.fadeIn(this.winTicker, 0.25);
      this.winTicker.reset();
    }
    if (appModel.getIsAutoSession()) {
      return;
    }
    if (appModel.getIsFreeSpinsSession()) {
      return;
    }

    this.totalWin += data.value;
    if (data.duration == 0) {
      const flag: boolean = !appModel.isCascadeGame() || !appModel.getIsFreeSpinsSession();
      this.winTicker.showSpinValue(this.totalWin, true, flag);
    } else {
      this.winTicker.countUpValue(this.totalWin, data.duration, true);
    }
    this.visible = true;
    EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_VISIBLE);
  }
  protected skipToFinalValue(): void {
    this.winTicker.skipToFinalValue();
  }
  protected clearSpinWin(): void {
    this.visible = false;
    this.totalWin = 0;
    EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_HIDDEN);
  }
  protected toggleVisibility(data: { show: boolean }): void {
    this.visible = data.show;
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_VISIBLE);
    } else {
      EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_HIDDEN);
    }
  }
}
