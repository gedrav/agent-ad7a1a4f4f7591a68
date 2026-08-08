import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';

export class PromoFSInfoComp extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly spinValueText: PixText;
  private readonly winValueText: PixText;

  constructor(config) {
    super(config);
    this.bg = UIUtil.getSprite('promofsInfoBG');
    this.addChild(this.bg);

    this.spinValueText = this.elementsList['spinValueText'];
    this.addChild(this.spinValueText);
    this.spinValueText.x = this.bg.width / 2;
    this.spinValueText.y = 50;

    this.winValueText = this.elementsList['winValueText'];
    this.addChild(this.winValueText);
    this.winValueText.x = this.bg.width / 2;
    this.winValueText.y = 150;

    this.visible = false;
    EventHandler.addEventListener(SlotEvents.UPDATE_PROMO_FS_INFO, this.updatePromoFS.bind(this));
  }

  private updatePromoFS(): void {
    const data = appModel.promoSpinInfo;
    if (!data) {
      this.visible = false;
      return;
    }
    this.visible = true;
    const count = Math.min(data.playCount, data.playCount - data.remainingPlayCount + 1);
    this.spinValueText.text = count + ' / ' + data.playCount;
    this.winValueText.text = Util.formatCurrency(data.totalWin);
  }
}
