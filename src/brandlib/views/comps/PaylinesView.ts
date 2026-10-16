import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
export class PaylinesView extends ResponsiveView {
  constructor(config) {
    super(config);

    this.hideAllPaylines();

    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.showSpinWinLines.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_LINE_WIN, this.showLineWin.bind(this));
    EventHandler.addEventListener(SlotEvents.CLEAR_WINS, this.hideAllPaylines.bind(this));
  }
  hideAllPaylines(): void {
    if (this.configData.totalLines) {
      for (let k = 1; k <= this.configData.totalLines; k++) {
        this.elementsList['payline' + k].visible = false;
      }
    }
    this.visible = false;
  }

  protected showSpinWinLines(): void {
    const winLines = appModel.getWinData();
    if (!winLines?.length) {
      return;
    }
    for (const item of winLines) {
      const payline = this.elementsList['payline' + item.lineNumber];
      if (payline) {
        payline.visible = true;
      }
    }
    this.visible = true;
  }

  protected showLineWin(): void {
    const currentLineWin = appModel.getCurrentLineWinData();
    if (!currentLineWin) {
      return;
    }
    const payline = this.elementsList['payline' + currentLineWin.lineNumber];
    if (payline) {
      payline.visible = true;
    }
    this.visible = true;
  }
}
