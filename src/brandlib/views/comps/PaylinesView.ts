import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
export class PaylinesView extends ResponsiveView {
  constructor(config) {
    super(config);

    if (this.configData.totalLines) {
      for (let k = 1; k <= this.configData.totalLines; k++) {
        this.elementsList['payline' + k].visible = false;
      }
    }

    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.showSpinWinLines.bind(this));
  }

  protected showSpinWinLines() {}
}
