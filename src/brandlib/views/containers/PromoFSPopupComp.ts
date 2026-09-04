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
import { GameProxy } from '@core/models/GameConfigProxy';

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
  private readonly skipBtn: PixFancyButton;
  private readonly remainingSpins: PixText;
  constructor(config) {
    super(config);
    this.bg = this.elementsList['bg'];
    UIUtil.setModalState(this.bg);
    // CoreLib.UIUtil.addInteraction(this.bg, this.hideBuyBonus.bind(this));
    this.panelBG = this.elementsList['panelBG'];
    this.entryContainer = this.elementsList['parentContainer'].elementsList['entryContainer'];
    this.entryContainer.visible = false;

    this.remainingSpins = this.entryContainer.elementsList['remainingSpins'];

    this.valueText1 = this.entryContainer.elementsList['valueText1'];
    this.promoBetValue = this.entryContainer.elementsList['promoBetValue'];
    this.valueText1.text = '';
    this.startBtn = this.entryContainer.elementsList['startBtn'];
    this.startBtn.onPress.connect(this.startBtnClick.bind(this));
    this.startBtn.enabled = true;

    this.skipBtn = this.entryContainer.elementsList['skipBtn'];
    this.skipBtn.onPress.connect(this.onSkipClicked.bind(this));
    this.skipBtn.enabled = true;

    this.exitContainer = this.elementsList['parentContainer'].elementsList['exitContainer'];
    this.exitContainer.visible = true;

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
    GameProxy.config.isModalOpened = true;
    this.exitContainer.visible = false;
    this.entryContainer.visible = true;
    const data = appModel.promoSpinInfo;
    this.valueText1.text = data?.playCount;
    this.promoBetValue.text = Util.formatCurrency(data?.betAmount);
    if (data.status === 'ACTIVE') {
      this.remainingSpins.visible = false;
      this.skipBtn.visible = true;
      this.startBtn.x = this.startBtn.configData.x;
    } else {
      this.skipBtn.visible = false;
      this.startBtn.x = 355;
      this.remainingSpins.visible = true;
      const remaining = data.remainingPlayCount;
      if (remaining > 1) {
        this.remainingSpins.text = Util.parseMessage(Util.getContent('remainingPromoSpins'), [remaining]);
      } else {
        this.remainingSpins.text = Util.getContent('lastPromoFSText');
      }

      this.startBtn.updateText(Util.getContent('ContinueBtnText'));
    }
    this.visible = true;
  }
  showPromoExitPopup() {
    GameProxy.config.isModalOpened = true;
    this.exitContainer.visible = true;
    this.entryContainer.visible = false;
    const data = appModel.promoSpinInfo;
    this.valueText3.text = Util.formatCurrency(data?.totalWin);
    this.visible = true;
  }
  protected startBtnClick() {
    this.visible = false;
    GameProxy.config.isModalOpened = false;
    StateManager.doNextStep(true);
  }
  protected onSkipClicked(): void {
    this.visible = false;
    GameProxy.config.isModalOpened = false;
    StateManager.doNextStep(false);
  }
  closeBtnClick() {
    StateManager.doNextStep();
    this.visible = false;
    GameProxy.config.isModalOpened = false;
  }

  resizeView() {
    super.resizeView();
    this.bg.width = UIUtil.getGameWidth();
    this.bg.height = UIUtil.getGameHeight();
  }
}
