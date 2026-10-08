import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { UIUtil } from '@core/utils/UIUtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class FeatureIntroPopupComp extends ResponsiveChildrenView {
  declare protected bg: any;
  declare protected options: any[];
  declare protected optionButtons: any[];
  declare protected pickRequest: Promise<void>;
  declare protected pendingShow: boolean;

  constructor(configData: any) {
    super(configData);
    EventHandler.addEventListener(SlotEvents.SHOW_PICK_FEATURE_POPUP, this.showPopup.bind(this));
  }

  protected onViewCreated(): void {
    super.onViewCreated();
    this.bg = this.elementsList['bg'];
    this.options = [this.elementsList['option1'], this.elementsList['option2']];
    this.optionButtons = [this.elementsList['option1Btn'], this.elementsList['option2Btn']];
    this.optionButtons.forEach((button, index) => {
      UIUtil.addInteraction(button, this.onOptionClicked.bind(this, index));
    });
    this.visible = false;
    if (this.pendingShow) {
      this.pendingShow = false;
      this.showPopup();
    }
  }

  protected showPopup(): void {
    if (!this.bg) {
      this.pendingShow = true;
      return;
    }
    this.visible = true;
    this.setOptionsClickable(true);
    this.showSpinCounts();
    this.bg.alpha = 0;
    AnimationProxy.animateTween(this.bg, { alpha: this.configData.bgAlpha, duration: 0.5 });
    this.options.forEach((option) => {
      option.alpha = 0;
      option.scale.set(1);
      AnimationProxy.animateTween(option, { alpha: 1, duration: 1 });
    });
  }

  protected showSpinCounts(): void {
    const counts = this.configData.spinCounts;
    const keys = Object.keys(counts).map(Number);
    const scatters = appModel.gameResult?.scatterCount;
    const tier = counts[scatters] ?? counts[Math.min(...keys)];
    this.options.forEach((option) => {
      const label = option.elementsList?.['message1'];
      if (label && tier[option.configData.selection] !== undefined) {
        label.text = `${tier[option.configData.selection]}`;
      }
    });
  }

  protected onOptionClicked(index: number): void {
    this.setOptionsClickable(false);
    EventHandler.dispatchEvent(SlotEvents.PLAY_PICK_FEATURE_BUTTON_CLICKED_SOUND);
    this.pickRequest = this.sendPick(index);
    AnimationProxy.animateTween(this.options[index], {
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 0.5,
      repeat: 2,
      yoyo: true,
      onComplete: this.onPickAnimComplete.bind(this),
    });
  }

  protected sendPick(index: number): Promise<void> {
    const featureType = appModel.getIsUnfinishedGame()
      ? appModel.getUnfinishedFeatureType()
      : appModel.getFeatureType();
    return MessageProxy.requestBonusData(featureType, this.options[index].configData.selection);
  }

  protected onPickAnimComplete(): void {
    this.pickRequest.then(this.onPickResponse.bind(this));
  }

  protected onPickResponse(): void {
    this.visible = false;
    StateManager.doNextStep();
  }

  protected setOptionsClickable(flag: boolean): void {
    this.optionButtons.forEach((button) => UIUtil.setClickable(button, flag));
  }
}
