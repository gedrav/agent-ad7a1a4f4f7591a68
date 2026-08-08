import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class PromoFSInfoComp extends ResponsiveChildrenView {
  private readonly spinValueText: PixText;
  private readonly winValueText: PixText;

  constructor(config) {
    super(config);
    this.spinValueText = this.elementsList['spinValueText'];
    this.winValueText = this.elementsList['winValueText'];

    this.visible = false;
    EventHandler.addEventListener(SlotEvents.UPDATE_PROMO_FS_INFO, this.updatePromoFS.bind(this));
  }

  private updatePromoFS(): void {
    const data = appModel.promoSpinInfo;
    if (!data || (data.status !== 'IN_PROGRESS' && data.status !== 'COMPLETED')) {
      this.visible = false;
      return;
    }
    this.visible = true;
    const count = data.playCount - data.remainingPlayCount;
    this.spinValueText.text = count + ' / ' + data.playCount;
    this.winValueText.text = Util.formatCurrency(data.totalWin);
  }
}
