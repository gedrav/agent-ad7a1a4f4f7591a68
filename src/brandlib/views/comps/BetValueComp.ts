import { PixResponsiveGraphics } from '@core/pixiwrapper/PixResponsiveGraphics';
import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class BetValueComp extends ResponsiveView {
  private bg: PixResponsiveGraphics;
  private labelText: PixText;
  private valueText: PixText;
  private padX: number;
  private padY: number;
  private gap: number;
  private hideTimer: any = null;

  constructor(config: any) {
    super(config);
    this.padX = config.padX ?? 30;
    this.padY = config.padY ?? 15;
    this.gap = config.gap ?? 12;
    this.bg = this.elementsList['betValueBg'];
    this.labelText = this.elementsList['betLabelText'];
    this.valueText = this.elementsList['betValueText'];
    if (!this.bg || !this.valueText) return;
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.onBetUpdate.bind(this));
  }

  protected onBetUpdate(value: number = null): void {
    const bet = value == null ? appModel.getTotalBet(true) : value;
    this.setValue(Util.formatCurrency(bet));
    this.visible = true;
    if (this.hideTimer != null) {
      clearTimeout(this.hideTimer);
    }
    this.hideTimer = setTimeout(() => {
      this.visible = false;
      this.hideTimer = null;
    }, 1000);
  }

  public setValue(value: string): void {
    if (!this.valueText) return;
    this.valueText.text = value;
    this.fitBgToText();
  }

  private fitBgToText(): void {
    const labelWid = this.labelText ? Math.ceil(this.labelText.width) : 0;
    const valueWid = Math.ceil(this.valueText.width);
    const contentWd = labelWid + (this.labelText ? this.gap : 0) + valueWid;
    const contentHt = Math.max(this.labelText ? Math.ceil(this.labelText.height) : 0, Math.ceil(this.valueText.height));
    const wid = contentWd + this.padX * 2;
    const ht = contentHt + this.padY * 2;
    this.bg.updateWidth(wid);
    this.bg.updateHeight(ht);
    if (this.labelText) {
      this.labelText.x = this.padX;
      this.labelText.y = ht / 2;
    }
    this.valueText.x = this.padX + labelWid + (this.labelText ? this.gap : 0);
    this.valueText.y = ht / 2;
    this.pivot.set(wid / 2, ht / 2);
  }
}
