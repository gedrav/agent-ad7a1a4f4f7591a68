import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';

export class FsTotalMultiplierComp extends ResponsesiveChildrenView {
  private multiplierVal: PixText;

  constructor(config) {
    super(config);
    this.visible = false;
    this.multiplierVal = this.elementsList['multiplierVal'];
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.updateUIForFreeSpinsStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFreeSpinsEnded.bind(this));
  }

  protected updateUIForFreeSpinsStart() {
    this.updateValueDurinFSEntry();
    this.visible = true;
  }

  protected onFreeSpinsEnded(): void {
    this.visible = false;
  }

  public updateMultiplier() {
    const value = appModel.getFreeSpinMultiplier();
    this.multiplierVal.text = value ? `${value}x` : '';
  }

  public updateValueDurinFSEntry() {
    const value = appModel.getInitialFreeSpinMultiplier();
    this.multiplierVal.text = value ? `${value}x` : '';
  }
}
