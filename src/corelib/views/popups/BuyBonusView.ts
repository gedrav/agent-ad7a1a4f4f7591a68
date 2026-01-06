import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';

import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';

export class BuyBonusView extends ResponsesiveChildrenView {
  private closeBtn: any;
  private buyFreeSpinsValueText: any;
  private stakeText: any;

  constructor(config: any) {
    super(config);

    this.closeBtn = this.elementsList['closeBtn'];
    this.buyFreeSpinsValueText = this.elementsList['buyFreeSpinsValueText'];
    this.stakeText = this.elementsList['stakeText'];

    this.visible = false;

    UIUtil.stopPropagation(this);

    EventHandler.addEventListener(SlotEvents.SHOW_BUY_BONUS_VIEW, this.showBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BUY_BONUS_VIEW, this.hideBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBuyBonusPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.hideBuyBonusView.bind(this));
  }
  protected hideBuyBonusView(): void {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
      this.visible = false;
    }
  }

  protected updateBuyBonusPanel(): void {
    if (this.visible && this.buyFreeSpinsValueText) {
      const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
      this.buyFreeSpinsValueText.text = Util.formatCurrency(appModel.getTotalBet() * multiplier);
      this.stakeText.text = Util.formatCurrency(appModel.getTotalBet());
    }
  }

  protected showBuyBonusView(bbId: any): void {
    GameProxy.config.selectedBB = bbId;
    const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
    this.buyFreeSpinsValueText.text = Util.formatCurrency(appModel.getTotalBet() * multiplier);
    this.stakeText.text = Util.formatCurrency(appModel.getTotalBet());
    this.visible = true;
    this.resizeView();
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
  }
}
