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
import { GameProxy } from '@core/models/GameConfigProxy';

export class PromoFSPopupComp extends ResponsiveChildrenView {
  private readonly bg: PixSprite;
  private readonly panelBG: PixSprite;
  private readonly entryContainer: PixView;
  private readonly valueText1: PixText;
  private readonly promoBetValue: PixText;
  private readonly startBtn: PixFancyButton;
  private readonly continueBtn: PixFancyButton;
  private readonly exitContainer: PixView;
  private readonly valueText3: PixText;
  private readonly closeBtn: PixFancyButton;

  constructor(config) {
    super(config);
    this.bg = this.elementsList['bg'];
    UIUtil.setModalState(this.bg);

    this.panelBG = this.elementsList['parentContainer'].elementsList['panelBG'];
    this.entryContainer = this.elementsList['parentContainer'].elementsList['entryContainer'];
    this.entryContainer.visible = true;

    this.valueText1 = this.entryContainer.elementsList['valueText1'];
    this.promoBetValue = this.entryContainer.elementsList['promoBetValue'];
    this.valueText1.text = '';
    this.startBtn = this.entryContainer.elementsList['startBtn'];
    this.startBtn.onPress.connect(this.startBtnClick.bind(this));
    this.startBtn.enabled = true;
    this.continueBtn = this.entryContainer.elementsList['continueBtn'];
    this.continueBtn.onPress.connect(this.continueBtnClick.bind(this));
    this.continueBtn.enabled = true;

    this.exitContainer = this.elementsList['parentContainer'].elementsList['exitContainer'];
    this.exitContainer.visible = false;

    this.valueText3 = this.exitContainer.elementsList['valueText3'];
    this.valueText3.text = '';
    this.closeBtn = this.exitContainer.elementsList['closeBtn'];
    this.closeBtn.enabled = true;
    this.closeBtn.onPress.connect(this.closeBtnClick.bind(this));

    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_ENTRY_POPUP, this.showPromoEntryPopup.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_PROMO_SPIN_EXIT_POPUP, this.showPromoExitPopup.bind(this));
  }

  showPromoEntryPopup() {
    GameProxy.config.isPopupOpened = true;
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.exitContainer.visible = false;
    this.entryContainer.visible = true;
    const data = appModel.promoSpinInfo;
    this.valueText1.text = data?.playCount ?? '';
    this.promoBetValue.text = data ? Util.formatCurrency(data.betAmount) : '';
    this.panelBG.height = 865;
    this.visible = true;
  }

  showPromoExitPopup() {
    GameProxy.config.isPopupOpened = true;
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.exitContainer.visible = true;
    this.entryContainer.visible = false;
    const data = appModel.promoSpinInfo;
    this.valueText3.text = data ? Util.formatCurrency(data.totalWin) : '';
    this.panelBG.width = 712;
    this.panelBG.height = 752;
    this.visible = true;
  }

  startBtnClick() {
    appModel.startPromoFSSession();
    EventHandler.dispatchEvent(SlotEvents.LOCK_BET_SELECTION);
    EventHandler.dispatchEvent(SlotEvents.UPDATE_PROMO_FS_INFO);
    this.closePopup();
  }

  continueBtnClick() {
    this.closePopup();
  }

  closeBtnClick() {
    EventHandler.dispatchEvent(SlotEvents.UNLOCK_BET_SELECTION);
    this.closePopup();
  }

  private closePopup(): void {
    GameProxy.config.isPopupOpened = false;
    EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
    this.visible = false;
    this.parent?.removeChild(this);
  }

  resizeView() {
    super.resizeView();
    this.bg.width = UIUtil.getGameWidth();
    this.bg.height = UIUtil.getGameHeight();
  }
}
