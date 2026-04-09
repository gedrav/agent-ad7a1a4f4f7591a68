import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { GameProxy } from '@core/models/GameConfigProxy';
import { Util } from '@core/utils/UtilService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class BuyBonusButtonComp extends StandardView {
  protected bbBetValue: any;
  protected bbBg: any;

  constructor(config: any) {
    super(config);

    this.bbBg = this.elementsList['bbBg'];
    this.bbBetValue = this.elementsList['bbBetValue'];
    this.setupInteraction();
    this.updateBBBetValue();
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBBBetValue.bind(this));
  }

  protected updateBBBetValue(): void {
    if (this.bbBetValue) {
      const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
      this.bbBetValue.text = Util.formatCurrency(appModel.getTotalBet() * multiplier);
    }
  }

  protected setupInteraction(): void {
    UIUtil.resumeInteraction(this);
    UIUtil.setHandCursor(this, true);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    UIUtil.addInteraction(this, this.onBuyBonusClicked.bind(this));
  }

  protected onBuyBonusClicked(): void {
    EventHandler.dispatchEvent(SlotEvents.SHOW_BUY_BONUS_VIEW);
  }
}
