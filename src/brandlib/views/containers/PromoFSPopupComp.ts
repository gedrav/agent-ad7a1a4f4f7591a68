import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixView } from '@core/pixiwrapper/PixView';
import { PixText } from '@core/pixiwrapper/PixText';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { Util } from '@core/utils/UtilService';
import { StateManager } from '@core/states/StateManagerService';

export class PromoFSPopupComp extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly panelBG: PixSprite;
  private readonly entryContainer: PixView;
  private readonly valueText1: PixText;
  private readonly promoBetValue: PixText;
  private readonly startBtn: PixFancyButton;
  private readonly exitContainer: PixView;
  private readonly valueText3: PixText;
  private readonly closeBtn: PixFancyButton;
  constructor(config) {
    super(config);
    this.bg = this.elementsList['bg'];
    UIUtil.setModalState(this.bg);
    // CoreLib.UIUtil.addInteraction(this.bg, this.hideBuyBonus.bind(this));
    this.panelBG = this.elementsList['parentContainer'].elementsList['panelBG'];
    this.entryContainer = this.elementsList['parentContainer'].elementsList['entryContainer'];
    this.entryContainer.visible = true;

    this.valueText1 = this.entryContainer.elementsList['valueText1'];
    this.promoBetValue = this.entryContainer.elementsList['promoBetValue'];
    this.valueText1.text = '';
    this.startBtn = this.entryContainer.elementsList['startBtn'];
    // this.startBtn.onPress.connect(this.startBtnClick.bind(this));
    // this.startBtn.enabled = true;

    this.exitContainer = this.elementsList['parentContainer'].elementsList['exitContainer'];
    this.exitContainer.visible = false;

    this.valueText3 = this.exitContainer.elementsList['valueText3'];
    this.valueText3.text = '';
    this.closeBtn = this.exitContainer.elementsList['closeBtn'];
    // this.closeBtn.enabled = true;
    // this.closeBtn.onPress.connect(this.closeBtnClick.bind(this));

    this.visible = false;
    // EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP, this.showPromoEntryPopup.bind(this));
    // EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_EXIT_POPUP, this.showPromoExitPopup.bind(this));

    //temporarily calling ,it can remove once BE implemented
    // this.showPromoEntryPopup();
    // this.showPromoExitPopup();
  }
  showPromoEntryPopup() {
    this.exitContainer.visible = false;
    this.entryContainer.visible = true;
    // const data = appModel.promoSpinInfo;
    // this.valueText1.text = data?.playCount;
    // this.promoBetValue.text = Util.formatCurrency(data?.betAmount);
    this.panelBG.height = 865;
    this.visible = true;
  }
  showPromoExitPopup() {
    this.exitContainer.visible = true;
    this.entryContainer.visible = false;
    // const data = appModel.promoSpinInfo;
    // this.valueText3.text = Util.formatCurrency(data?.totalWin);
    this.panelBG.width = 712;
    this.panelBG.height = 752;
    this.visible = true;
  }
  startBtnClick() {
    this.visible = false;
    StateManager.doNextStep();
  }
  closeBtnClick() {
    StateManager.doNextStep();
    this.visible = false;
  }

  resizeView() {
    super.resizeView();
    this.bg.width = UIUtil.getGameWidth();
    this.bg.height = UIUtil.getGameHeight();
  }
}
