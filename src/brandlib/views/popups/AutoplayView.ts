import { ResponsesiveChildrenView } from '@core/pixiwrapper/ResponsesiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AppEvents } from '@core/events/AppEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';

export class AutoplayView extends ResponsesiveChildrenView {
  private valuesArray: number[];
  private spinBtnsArray: any[] = [];
  private autoPanelBg: any;
  private autoCont: any;
  private titleText1: any;
  private betSelectionContainer: any;
  private sliderContainer: any;
  private cancelBtn: any;
  private startBtn: any;
  private numberOfSpinsText: any;
  private btn1: any;
  private btn2: any;
  private btn3: any;
  private btn4: any;
  private btn5: any;
  private stopSpinText: any;
  private onAnyWin: any;
  private onBonusWin: any;
  private singleWinSlider: any;
  private balanceIncreaseSlider: any;
  private balanceDecreaseSlider: any;
  private selectedSpins: number = 50;

  constructor(config: any) {
    super(config);
    EventHandler.addEventListener(SlotEvents.SHOW_AUTO_PLAY_PANEL, this.showAutoPlayPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_NO_OF_SPIN_BTN_CLICKED, this.updateSelectedBtn.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_UPDATE_TOGGLE_STATE, this.onToggleStateUpdate.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_CANCEL_CLICKED, this.hideAutoPlayPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.MODAL_VIEW_CLICKED, this.hideAutoPlayPanel.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_CONFIRM_BTN_CLICKED, this.onOkClicked.bind(this));
    EventHandler.addEventListener(SlotEvents.AUTOPLAY_ENDED, this.resetAutoplayView.bind(this));
    EventHandler.addEventListener(AppEvents.APP_RESIZE, this.resizeView.bind(this));
  }
  protected onViewCreated() {
    super.onViewCreated();
    this.autoCont = this.elementsList['autoCont'];
    this.autoPanelBg = this.autoCont.elementsList['autoPanelBg'];
    this.titleText1 = this.autoCont.elementsList['titleText1'];
    this.betSelectionContainer = this.autoCont.elementsList['betSelectionContainer'];
    this.sliderContainer = this.autoCont.elementsList['sliderContainer'];
    this.cancelBtn = this.autoCont.elementsList['cancelBtn'];
    this.startBtn = this.autoCont.elementsList['startBtn'];
    this.numberOfSpinsText = this.betSelectionContainer.elementsList['numberOfSpinsText'];
    this.btn1 = this.betSelectionContainer.elementsList['btn1'];
    this.btn2 = this.betSelectionContainer.elementsList['btn2'];
    this.btn3 = this.betSelectionContainer.elementsList['btn3'];
    this.btn4 = this.betSelectionContainer.elementsList['btn4'];
    this.btn5 = this.betSelectionContainer.elementsList['btn5'];
    this.stopSpinText = this.sliderContainer.elementsList['stopSpinText'];
    this.onAnyWin = this.sliderContainer.elementsList['onAnyWin'];
    this.onBonusWin = this.sliderContainer.elementsList['onBonusWin'];
    this.singleWinSlider = this.sliderContainer.elementsList['singleWinSlider'];
    this.balanceIncreaseSlider = this.sliderContainer.elementsList['balanceIncreaseSlider'];
    this.balanceDecreaseSlider = this.sliderContainer.elementsList['balanceDecreaseSlider'];

    this.valuesArray = [5, 10, 25, 50, 100];

    const betContainer = this.autoCont.elementsList['betSelectionContainer'];
    for (let i = 0; i < this.valuesArray.length; i++) {
      const btn = betContainer?.elementsList?.[`btn${i + 1}`];
      if (btn && btn.textView) {
        btn.updateText(this.valuesArray[i].toString());
        btn.setData(this.valuesArray[i]);
        btn.textView.anchor.set(0.5, 0.5);
        this.spinBtnsArray.push(btn);
      }
    }

    this.updateSelectedBtn(this.valuesArray[1]);
    this.visible = false;

    UIUtil.stopPropagation(this.autoCont);
  }

  protected async hideAutoPlayPanel() {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
      await this.destroyElements();
      this.parent.removeChild(this);
    }
  }

  protected onOkClicked(): void {
    const obj: any = {};
    obj.selectedSpins = this.selectedSpins;
    obj.onAnyWin = this.onAnyWin?.isSelected || false;
    obj.onBonusWin = this.onBonusWin?.isSelected || false;
    obj.onSingleWinExceeds = this.singleWinSlider?.getValue() || 0;
    obj.balanceIncreaseBy = this.balanceIncreaseSlider?.getValue() || 0;
    obj.balanceDecreaseBy = this.balanceDecreaseSlider?.getValue() || 0;
    StateManager.goToState(STATES.START_AUTOSPIN_STATE, obj);
    this.hideAutoPlayPanel();
  }

  // Reset to defaults and show autoplay panel
  protected async showAutoPlayPanel() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    await this.createLazyView();
    this.resetAutoplayView();
    this.onBonusWin.setSelected(true);
    this.resizeView();
    this.visible = true;
  }

  protected updateSelectedBtn(value: number): void {
    this.selectedSpins = value;
    for (let i = 0; i < this.spinBtnsArray.length; i++) {
      this.spinBtnsArray[i].setSelected(false);
      if (this.spinBtnsArray[i].configData.data === value) {
        this.spinBtnsArray[i].setSelected(true);
      }
    }
  }

  protected onToggleStateUpdate(btn: PixToggleButton): void {
    const sliderContainer = this.autoCont.elementsList['sliderContainer'];
    if (btn) {
      btn.setSelected(!btn.isSelected);
    }
  }

  // Reset autoplay panel to default values after autoplay completes
  protected resetAutoplayView(): void {
    this.updateSelectedBtn(this.valuesArray[1]);
    if (this.onAnyWin?.isSelected) this.onAnyWin.setSelected(false);
    if (this.onBonusWin?.isSelected) this.onBonusWin.setSelected(false);
    if (this.singleWinSlider) this.singleWinSlider.value = 0;
    if (this.balanceIncreaseSlider) this.balanceIncreaseSlider.value = 0;
    if (this.balanceDecreaseSlider) this.balanceDecreaseSlider.value = 0;
  }

  protected resizeView(): void {
    if (!this.viewCreated) return;
    super.resizeView();

    UIUtil.adjustForMobile(this.autoCont);
    UIUtil.adjustForMobile(this.autoPanelBg);
    UIUtil.adjustForMobile(this.titleText1);
    UIUtil.adjustForMobile(this.betSelectionContainer);
    UIUtil.adjustForMobile(this.sliderContainer);
    UIUtil.adjustForMobile(this.cancelBtn);
    UIUtil.adjustForMobile(this.startBtn);
    UIUtil.adjustForMobile(this.numberOfSpinsText);
    UIUtil.adjustForMobile(this.btn1);
    UIUtil.adjustForMobile(this.btn2);
    UIUtil.adjustForMobile(this.btn3);
    UIUtil.adjustForMobile(this.btn4);
    UIUtil.adjustForMobile(this.btn5);
    UIUtil.adjustForMobile(this.stopSpinText);
    UIUtil.adjustForMobile(this.onAnyWin);
    UIUtil.adjustForMobile(this.onBonusWin);
    UIUtil.adjustForMobile(this.singleWinSlider);
    UIUtil.adjustForMobile(this.balanceIncreaseSlider);
    UIUtil.adjustForMobile(this.balanceDecreaseSlider);
  }
}
