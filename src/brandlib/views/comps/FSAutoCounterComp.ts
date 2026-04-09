import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';

export class FSAutoCounterComp extends StandardView {
  private spinsText: PixText;
  private winningsText: PixText;
  constructor(config) {
    super(config);
    this.visible = false;

    this.spinsText = this.elementsList['spinsText'];
    this.winningsText = this.elementsList['winningsText'];
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_UI_START, this.updateUIForAutoStart.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_COUNT, this.updateUIAutoCount.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_ENDED, this.onAutoplayEnded.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_COUNT, this.updateUIFreeSpinsCount.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_FS_TOTALWIN, this.updateFSTotalWin.bind(this));
  }
  protected updateUIForAutoStart(): void {
    this.visible = true;
  }
  protected updateUIAutoCount(): void {
    if (appModel.getIsFreeSpinsSession()) {
    } else {
      const totalspins = appModel.getAutoSpinTotalCount();
      const currentSpin = appModel.getAutoSpinCurrentCount();
      this.spinsText.text = Util.parseMessage(Util.getContent('spinsCounterText'), [currentSpin, totalspins]);
      const totalwin = appModel.getTotalAutoWin();
      this.winningsText.text = Util.parseMessage(Util.getContent('winningsText'), [Util.formatCurrency(totalwin)]);
    }
  }
  protected onAutoplayEnded(): void {
    this.visible = false;
  }
  protected updateUIForFreeSpinsStart(): void {
    this.visible = true;
  }
  protected updateUIFreeSpinsCount(): void {
    const totalspins = appModel.getTotalFreespins();
    const currentSpin = appModel.getCurrentFreeSpin();
    this.spinsText.text = Util.parseMessage(Util.getContent('spinsCounterText'), [currentSpin, totalspins]);
  }
  protected updateFSTotalWin(): void {
    const totalwin = appModel.getTotalFreespinWinAmount();
    this.winningsText.text = Util.parseMessage(Util.getContent('winningsText'), [Util.formatCurrency(totalwin)]);
  }
  protected onFreeSpinsEnded(): void {
    this.visible = false;
  }
}
