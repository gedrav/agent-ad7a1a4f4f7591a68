import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { GameProxy } from '@core/models/GameConfigProxy';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixView } from '@core/pixiwrapper/PixView';

export class BuyBonusView extends ResponsiveChildrenView {
  protected buyFreeSpinsValueText: any;
  protected splashImage: PixSprite;
  protected buyBonusBg: PixSprite;
  protected titleText: PixText;
  protected cancelBtn: PixFancyButton;
  protected startBtn: PixFancyButton;
  private bbCont: PixView;

  constructor(config: any) {
    super(config);
    this.bbCont = this.elementsList['bbCont'];
    this.buyBonusBg = this.elementsList['buyBonusBg'];
    this.titleText = this.elementsList['titleText'];
    this.cancelBtn = this.elementsList['cancelBtn'];
    this.startBtn = this.elementsList['startBtn'];
    EventHandler.addEventListener(SlotEvents.SHOW_BUY_BONUS_VIEW, this.showBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BUY_BONUS_VIEW, this.hideBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBuyBonusPanel.bind(this));

    this.buyFreeSpinsValueText = this.bbCont.elementsList['buyFreeSpinsValueText'];

    this.splashImage = this.bbCont.elementsList['splashImage'];
    this.splashImage.texture = UIUtil.getTexture(GameProxy.config.bbImage);
    this.resizeView();

    this.visible = false;
    UIUtil.stopPropagation(this);
  }
  protected resizeView(): void {
    super.resizeView();
  }

  protected async hideBuyBonusView() {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    }
  }

  protected updateBuyBonusPanel(): void {
    if (this.buyFreeSpinsValueText) {
      const multiplier = appModel.getBuyBonusMultiplier(GameProxy.config.selectedBB);
      this.buyFreeSpinsValueText.text = Util.formatCurrency(appModel.getTotalBet() * multiplier);
    }
  }

  protected async showBuyBonusView(bbId: any) {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    GameProxy.config.selectedBB = bbId;
    this.updateBuyBonusPanel();
    this.visible = true;
    this.resizeView();
  }
}
