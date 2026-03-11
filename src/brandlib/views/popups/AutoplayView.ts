import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { AppEvents } from '@core/events/AppEvents';
import { StateManager } from '@core/states/StateManagerService';
import { STATES } from '@core/states/StateConstants';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { PixFancyButton } from '@core/pixiwrapper/PixFancyButton';
import { PixToggleButton } from '@core/pixiwrapper/PixToggleButton';

export class AutoplayView extends ResponsiveChildrenView {
  private valuesArray: number[];
  private spinBtnsArray: any[] = [];
  private autoPanelBg: any;
  private autoCont: any;
  private titleText: any;
  private numberSelectionContainer: any;
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

    this.autoPanelBg = this.elementsList['autoPanelBg'];
    this.titleText = this.elementsList['titleText'];
    this.numberSelectionContainer = this.elementsList['numberSelectionContainer'];
    this.sliderContainer = this.elementsList['sliderContainer'];
    this.cancelBtn = this.elementsList['cancelBtn'];
    this.startBtn = this.elementsList['startBtn'];
    this.numberOfSpinsText = this.numberSelectionContainer.elementsList['numberOfSpinsText'];
    this.btn1 = this.numberSelectionContainer.elementsList['btn1'];
    this.btn2 = this.numberSelectionContainer.elementsList['btn2'];
    this.btn3 = this.numberSelectionContainer.elementsList['btn3'];
    this.btn4 = this.numberSelectionContainer.elementsList['btn4'];
    this.btn5 = this.numberSelectionContainer.elementsList['btn5'];
    this.singleWinSlider = this.sliderContainer.elementsList['singleWinSlider'];

    this.valuesArray = [5, 10, 25, 50, 100];

    this.spinBtnsArray = [];
    const betContainer = this.elementsList['numberSelectionContainer'];
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
    //this.visible = false;

    UIUtil.stopPropagation(this);
  }

  protected async hideAutoPlayPanel() {
    if (this.visible) {
      EventHandler.dispatchEvent(SlotEvents.HIDE_MODAL_VIEW);
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
}
