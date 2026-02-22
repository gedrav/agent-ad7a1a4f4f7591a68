import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';
import { Util } from '@core/utils/UtilService';
import { appModel } from '@core/models/services/AppModelService';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';

export class BetPanelView extends ResponsesiveChildrenView {
  private closeBtn: any;
  private betBtnsArray: PixToggleButton[] = [];
  private upStakeBtn: any;
  private downStakeBtn: any;
  private stakeText: any;

  constructor(config: any) {
    console.log('BetPanelView constructor');
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_BET_PANEL, this.showBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.HIDE_BET_PANEL, this.hideBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.UPDATE_TOTALBET, this.updateBetPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.hideBetPanel.bind(this));
  }
  protected onViewCreated() {
    super.onViewCreated();
    this.closeBtn = this.elementsList['closeBtn'];
    this.upStakeBtn = this.elementsList['upStakeBtn'];
    this.downStakeBtn = this.elementsList['downStakeBtn'];
    this.stakeText = this.elementsList['stakeText'];

    const totalBetsArray = Util.cloneArray(appModel.getAllBets());

    this.betBtnsArray = [];
    let buttonCount = 0;
    while (this.elementsList[`btn${buttonCount + 1}`]) {
      buttonCount++;
    }

    if (totalBetsArray && totalBetsArray.length >= buttonCount) {
      const lastBets = totalBetsArray.slice(-buttonCount);
      for (let i = 0; i < lastBets.length; i++) {
        const btn = this.elementsList[`btn${i + 1}`];
        if (btn) {
          if (btn.textView) {
            btn.updateText(Util.formatCurrencyNoSymbol(lastBets[i]));
            btn.setData(lastBets[i]);
            btn.textView.anchor.set(0.5, 0.5);
          }
          this.betBtnsArray.push(btn);
        }
      }
    }

    this.visible = false;

    UIUtil.stopPropagation(this);
  }
  protected async hideBetPanel() {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
      await this.destroyElements();
      this.parent.removeChild(this);
    }
  }
  protected async showBetPanel() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    await this.createLazyView();
    this.updateBetPanel();
    this.resizeView();
    this.visible = true;
  }
  protected updateBetPanel(data: any = null): void {
    if (!this.viewCreated) {
      return;
    }
    this.stakeText.text = Util.formatCurrency(appModel.getTotalBet());
    const len = this.betBtnsArray.length;
    for (let i = 0; i < len; i++) {
      this.betBtnsArray[i].setSelected(false);
      if (this.betBtnsArray[i].configData.data == appModel.getTotalBet()) {
        this.betBtnsArray[i].setSelected(true);
      }
    }
    this.downStakeBtn.enabled = appModel.getBetPos() != 0;
    this.upStakeBtn.enabled = appModel.getBetPos() != appModel.getAllBets().length - 1;
  }
}
