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
import { PixResponsiveGraphics } from '@core/pixiwrapper/PixResponsiveGraphics';
import { Input } from '@pixi/ui';
import { Util } from '@core/utils/UtilService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';

export class AutoplayView extends ResponsiveChildrenView {
  private valuesArray: number[];
  private spinBtnsArray: any[] = [];
  private autoPanelBg: PixResponsiveGraphics;
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
  private spendingLimitSlider: any;
  private spendingLimitInput: Input;
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
    this.spendingLimitSlider = this.sliderContainer.elementsList['spendingLimitSlider'];
    this.spendingLimitInput = this.sliderContainer.elementsList['spendingLimitInput'];
    const spendingMinLimitText = this.sliderContainer.elementsList['spendingMinLimitText'];
    const spendingMaxLimitText = this.sliderContainer.elementsList['spendingMaxLimitText'];

    if (spendingMinLimitText) spendingMinLimitText.text = Util.formatCurrency(this.spendingLimitSlider?.min ?? 0);
    if (spendingMaxLimitText) spendingMaxLimitText.text = Util.formatCurrency(this.spendingLimitSlider?.max ?? 0);

    this.spendingLimitSlider?.onUpdate.connect((value: number) => {
      if (this.spendingLimitInput) {
        this.spendingLimitInput.value = value === this.spendingLimitSlider.min ? '' : Util.toString(Math.round(value));
      }
    });

    this.spendingLimitInput?.onChange.connect((text: string) => {
      const min = this.spendingLimitSlider?.min ?? 0;
      const max = this.spendingLimitSlider?.max ?? 0;
      const parsed = parseFloat(text);
      const clamped = isNaN(parsed) ? min : Math.min(Math.max(Math.round(parsed), min), max);
      this.spendingLimitInput.value = clamped === min ? '' : Util.toString(clamped);
      if (this.spendingLimitSlider) this.spendingLimitSlider.value = clamped;
    });

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
    obj.spendingLimit = this.spendingLimitSlider?.getValue() || 0;
    StateManager.goToState(STATES.START_AUTOSPIN_STATE, obj);
    this.hideAutoPlayPanel();
  }

  // Reset to defaults and show autoplay panel
  protected async showAutoPlayPanel() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_MODAL_VIEW);
    this.resetAutoplayView();
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
    if (this.spendingLimitSlider) this.spendingLimitSlider.value = this.spendingLimitSlider.min;
    if (this.spendingLimitInput) this.spendingLimitInput.value = '';
  }

  protected resizeView(): void {
    if (DeviceProxy.config.isDesktop) {
      this.autoPanelBg.width = this.autoPanelBg.configData.width;
      this.autoPanelBg.height = this.autoPanelBg.configData.height;
    } else {
      if (DeviceProxy.config.isPortrait) {
        this.autoPanelBg.width = this.autoPanelBg.configData.pWidth;
        this.autoPanelBg.height = this.autoPanelBg.configData.pHeight;
      } else {
        this.autoPanelBg.width = this.autoPanelBg.configData.lWidth;
        this.autoPanelBg.height = this.autoPanelBg.configData.lHeight;
      }
    }
    this.numberSelectionContainer.x =
      (this.autoPanelBg.width - this.numberSelectionContainer.width) / 2 + this.btn1.width / 2;
    this.sliderContainer.x = (this.autoPanelBg.width - this.sliderContainer.width) / 2;
    super.resizeView();
  }
}
