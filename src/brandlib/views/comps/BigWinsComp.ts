import { CONSTANTS } from '@core/utils/CONSTANTS';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { WinTicker } from '@core/views/comps/WinTicker';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { UIUtil } from '@core/utils/UIUtilService';

const STATES: string[] = [CONSTANTS.BIG_WIN, CONSTANTS.MEGA_WIN, CONSTANTS.GIGANTIC_WIN, CONSTANTS.UNBELIEVABLE_WIN];
export class BigWinsComp extends ResponsiveView {
  protected winTicker: WinTicker;
  protected bigWinAnim: PixSpine;
  protected winTimerId: any;
  protected currentLevel: number;
  protected targetLevel: number;
  protected totalDuration: number;
  protected currentState: string;
  protected timeoutId: any;
  protected intervalDelay: number;
  private skipRect: PixGraphics;
  private winState: boolean = false;
  private isSkipping: boolean = false;

  constructor(config) {
    super(config);
  }
  protected onViewCreated() {
    super.onViewCreated();
    this.winTicker = this.elementsList['winTicker'];
    this.winTicker.reset();
    this.winTicker.on('COUNTUP_COMPLETED', this.onCountUpCompleted.bind(this));
    this.bigWinAnim = this.elementsList['bigWinAnim'];
    if (this.bigWinAnim) {
      this.bigWinAnim.stopAnimation();
      this.bigWinAnim.visible = false;
      this.bigWinAnim.addEventListener('complete', this.onAnimComplete.bind(this));
    }

    this.skipRect = this.elementsList['skipRect'];
    UIUtil.addInteraction(this.skipRect, this.onSkipClicked.bind(this));
    UIUtil.setClickable(this.skipRect, true);
    this.skipRect.visible = false;
  }

  protected onSkipClicked() {
    if (this.winState) {
      clearTimeout(this.timeoutId);
      clearTimeout(this.winTimerId);
      this.currentLevel = this.targetLevel - 1;
      this.currentState = STATES[this.currentLevel];
      this.isSkipping = true;
      this.playNextWinAnimation();
      this.playEndAnimation();
      if (this.bigWinAnim) {
        this.bigWinAnim.stopAnimation();
        this.winTicker.skipToFinalValue();
      }

      EventHandler.dispatchEvent(SlotEvents.SKIP_REELTICKER_WIN);
      const duration = 2000;
      this.winTimerId = setTimeout(() => this.notifyWinDone(), duration);
    }
  }

  public async showTumbleWin() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
      value: appModel.getTumbleSpinWin(),
      duration: 0,
    });
  }

  public async showSpinWin() {
    const winType = appModel.getWinType();
    if (winType === CONSTANTS.BELOW_TOTALBET_WIN || winType === CONSTANTS.STANDARD_WIN) {
      const duration = 2000;
      clearTimeout(this.winTimerId);
      this.winTicker.showSpinValue(appModel.getSpinWin());
      if (!appModel.isCascadeGame()) {
        EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
          value: appModel.getSpinWin(),
          duration: 0,
        });
      }
      this.winTimerId = setTimeout(() => this.notifyWinDone(), duration);
    } else {
      this.winState = true;
      this.skipRect.visible = true;
      this.currentLevel = 0;
      this.currentState = CONSTANTS.BIG_WIN;
      switch (winType) {
        case CONSTANTS.BIG_WIN:
          this.targetLevel = 1;
          this.totalDuration = 4000;
          break;
        case CONSTANTS.MEGA_WIN:
          this.targetLevel = 2;
          this.totalDuration = 6000;
          break;
        case CONSTANTS.GIGANTIC_WIN:
          this.targetLevel = 3;
          this.totalDuration = 8000;
          break;
        case CONSTANTS.UNBELIEVABLE_WIN:
          this.targetLevel = 4;
          this.totalDuration = 10000;
          break;
        default:
          break;
      }
      if (this.targetLevel > this.currentLevel) {
        if (this.bigWinAnim) {
          this.bigWinAnim.visible = true;
        }

        this.winTicker.countUpValue(appModel.getSpinWin(), this.totalDuration);
        this.playNextWinAnimation();
        this.intervalDelay = (this.totalDuration - 2000) / this.targetLevel;
        if (!appModel.isCascadeGame()) {
          EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
            value: appModel.getSpinWin(),
            duration: this.totalDuration,
          });
        }
        if (this.currentLevel < this.targetLevel - 1) {
          this.timeoutId = setTimeout(this.playEndAnimation.bind(this), this.intervalDelay);
        }
      }
    }
  }

  protected notifyWinDone(): void {
    this.winState = false;
    this.skipRect.visible = false;
    clearTimeout(this.timeoutId);
    clearTimeout(this.winTimerId);
    StateManager.doNextStep();
  }
  public clearSpinWin(): void {
    clearTimeout(this.winTimerId);
    this.winTicker?.reset();
    clearTimeout(this.timeoutId);
    if (this.bigWinAnim) {
      this.bigWinAnim?.stopAnimation();
      if (this.bigWinAnim) {
        this.bigWinAnim.visible = false;
      }
    }
  }
  public showLineWin(): void {}

  protected playNextWinAnimation(): void {
    if (this.bigWinAnim) {
      this.bigWinAnim.playAnimation({ state: this.configData.data.animations[this.currentState].start, loop: false });
    }
  }
  protected onAnimComplete(data: any): void {
    if (this.isSkipping) {
      return;
    }
    if (data.animation.name === this.configData.data.animations[this.currentState].start) {
      this.bigWinAnim.playAnimation({ state: this.configData.data.animations[this.currentState].idle, loop: true });
    } else if (data.animation.name === this.configData.data.animations[this.currentState].end) {
      this.checkForNextAnim();
    }
  }

  protected onCountUpCompleted(): void {
    clearTimeout(this.timeoutId);
    console.log('count up completed');
    this.timeoutId = setTimeout(this.notifyWinDone.bind(this), 1000);
  }
  protected playEndAnimation(): void {
    if (this.bigWinAnim) {
      this.bigWinAnim.playAnimation({ state: this.configData.data.animations[this.currentState].end, loop: false });
    }
  }
  protected checkForNextAnim() {
    this.currentLevel++;
    if (this.currentLevel >= this.targetLevel) {
      console.log('all completed send done notification');
    } else {
      this.currentState = STATES[this.currentLevel];
      this.playNextWinAnimation();
      if (this.currentLevel < this.targetLevel - 1) {
        this.timeoutId = setTimeout(this.playEndAnimation.bind(this), this.intervalDelay);
      }
      EventHandler.dispatchEvent(STATES[this.currentLevel] + 'START');
    }
  }
}
