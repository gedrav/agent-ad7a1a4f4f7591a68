import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';

export class FsTotalMultiplierComp extends ResponsiveChildrenView {
  private readonly multiplierValText: PixText;
  private totalmultiplierVal: number = 0;

  constructor(config) {
    super(config);
    this.visible = false;
    this.multiplierValText = this.elementsList['multiplierValText'];
    GameProxy.config.FsTotalMultiplierComp = this.multiplierValText; // to get global pos and animate to otehr comp
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
  }

  protected updateUIForFreeSpinsStart() {
    this.updateValueDurinFSEntry();
    this.visible = true;
  }

  protected onFreeSpinsEnded(): void {
    this.totalmultiplierVal = 0;
    this.visible = false;
  }

  public updateMultiplier() {
    const value = appModel.getFreeSpinMultiplier();
    this.totalmultiplierVal = value;
    this.multiplierValText.text = value ? `${value}x` : '';
  }

  public updateValueDurinFSEntry() {
    const value = appModel.getInitialFreeSpinMultiplier();
    this.totalmultiplierVal = value;
    this.multiplierValText.text = value ? `${value}x` : '';
  }

  public getTotalMultiTextComp() {
    return this.multiplierValText;
  }

  public getCurrentTotalMultiplierVal() {
    return this.totalmultiplierVal ? this.totalmultiplierVal : 0;
  }
}
