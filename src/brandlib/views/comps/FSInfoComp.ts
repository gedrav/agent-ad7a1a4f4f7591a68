import { StandardView } from '@core/pixiwrapper/StandardView';
import { PixText } from '@core/pixiwrapper/PixText';
import { Util } from '@core/utils/UtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { FSCountComp } from '@brand/views/comps/FSCountComp';
import { WinTicker } from '@core/views/comps/WinTicker';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class FSInfoComp extends ResponsiveChildrenView {
  private fsCountComp: FSCountComp;
  private fsWinComp: WinTicker;

  constructor(config) {
    super(config);
    this.visible = false;
    this.fsCountComp = this.elementsList['fsCountComp'];
    this.fsWinComp = this.elementsList['fsWinComp'];
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_COUNT, this.updateUIFreeSpinsCount.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_FS_TOTALWIN, this.updateFSTotalWin.bind(this));
  }
  protected updateUIForFreeSpinsStart(): void {
    this.visible = true;
  }
  protected updateUIFreeSpinsCount(): void {
    this.fsCountComp.updateValue(appModel.getCurrentFreeSpin() + '/' + appModel.getTotalFreespins());
  }
  protected updateFSTotalWin(): void {
    this.fsWinComp.showSpinValue(appModel.getTotalFreespinWinAmount(), true);
  }
  protected onFreeSpinsEnded(): void {
    this.visible = false;
  }
}
