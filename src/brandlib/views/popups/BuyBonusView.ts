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
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class BuyBonusView extends ResponsiveChildrenView {
  protected buyFreeSpinsValueText: any;
  protected splashImage: PixSprite;
  protected buyBonusBg: PixSprite;
  protected titleText: PixText;
  protected cancelBtn: PixFancyButton;
  protected startBtn: PixFancyButton;
  private bbCont: PixView;
  private upStakeBtn: PixFancyButton;
  private downStakeBtn: PixFancyButton;
  private stakeText: any;
  private stakeContainer: PixView;

  constructor(config: any) {
    super(config);
    this.bbCont = this.elementsList['bbCont'];
    this.buyBonusBg = this.elementsList['buyBonusBg'];
    this.titleText = this.elementsList['titleText'];
    this.cancelBtn = this.elementsList['cancelBtn'];
    this.startBtn = this.elementsList['startBtn'];
    this.stakeContainer = this.elementsList['stakeContainer'];
    this.upStakeBtn = this.stakeContainer.elementsList['upStakeBtn'];
    this.downStakeBtn = this.stakeContainer.elementsList['downStakeBtn'];
    this.stakeText = this.stakeContainer.elementsList['stakeText'];
    EventHandler.addEventListener(SlotEvents.SHOW_BUY_BONUS_VIEW, this.showBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BUY_BONUS_VIEW, this.hideBuyBonusView.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBuyBonusPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBetPanel.bind(this));

    this.buyFreeSpinsValueText = this.elementsList['buyFreeSpinsValueText'];
    this.splashImage = this.elementsList['splashImage'];

    //this.splashImage.texture = UIUtil.getTexture(GameProxy.config.bbImage);
    this.resizeView();

    this.visible = false;
    UIUtil.stopPropagation(this);
  }
  protected updateBetPanel(data: any = null): void {
    if (!this.viewCreated) return;
    this.stakeText.text = Util.formatCurrency(appModel.getTotalBet());
    this.downStakeBtn.enabled = appModel.getBetPos() > 0;
    this.upStakeBtn.enabled = appModel.getBetPos() < appModel.getAllBets().length - 1;
  }
  protected resizeView(): void {
    if (DeviceProxy.config.isDesktop) {
      this.buyBonusBg.width = this.buyBonusBg.configData.width;
      this.buyBonusBg.height = this.buyBonusBg.configData.height;
    } else {
      if (DeviceProxy.config.isPortrait) {
        this.buyBonusBg.width = this.buyBonusBg.configData.pWidth;
        this.buyBonusBg.height = this.buyBonusBg.configData.pHeight;
      } else {
        this.buyBonusBg.width = this.buyBonusBg.configData.lWidth;
        this.buyBonusBg.height = this.buyBonusBg.configData.lHeight;
      }
    }
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
    this.updateBetPanel();
  }

  protected async showBuyBonusView(bbId: any) {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    GameProxy.config.selectedBB = bbId;
    this.updateBuyBonusPanel();
    this.visible = true;
    this.resizeView();
  }
}
