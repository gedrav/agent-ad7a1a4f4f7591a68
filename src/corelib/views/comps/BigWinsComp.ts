import { CONSTANTS } from '@core/utils/CONSTANTS';
import { ResponsesiveView } from '@core/pixiwrapper/ResponsesiveView';
import { WinTicker } from '@core/views/comps/WinTicker';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { appModel } from '@core/models/services/AppModelService';
import { StateManager } from '@core/states/StateManagerService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';

const STATES: string[] = [CONSTANTS.BIG_WIN, CONSTANTS.MEGA_WIN, CONSTANTS.GIGANTIC_WIN, CONSTANTS.UNBELIEVABLE_WIN];
export class BigWinsComp extends ResponsesiveView {
  protected winTicker: WinTicker;
  protected bigWinAnim: PixSpine;
  protected winTimerId: any;
  protected currentLevel: number;
  protected targetLevel: number;
  protected totalDuration: number;
  protected currentState: string;
  protected timeoutId: any;
  protected intervalDelay: number;

  constructor(config) {
    super(config);
    this.winTicker = this.elementsList['winTicker'];
    this.winTicker.reset();
    this.winTicker.on('COUNTUP_COMPLETED', this.onCountUpCompleted.bind(this));
    this.bigWinAnim = this.elementsList['bigWinAnim'];
    this.bigWinAnim.stopAnimation();
    this.bigWinAnim.visible = false;
    this.bigWinAnim.addEventListener('complete', this.onAnimComplete.bind(this));
  }

  public async showSpinWin() {
    const winType = appModel.getWinType();
    if (winType === CONSTANTS.BELOW_TOTALBET_WIN || winType === CONSTANTS.STANDARD_WIN) {
      const isCascade = appModel.isCascadeGame();
      const value = isCascade ? appModel.getTumbleSpinWin() : appModel.getSpinWin();
      const duration = 2000;
      const display = isCascade ? this.winTicker.showSpinValue : this.winTicker.countUpValue;
      clearTimeout(this.winTimerId);
      display.call(this.winTicker, value);
      this.winTimerId = setTimeout(() => this.notifyWinDone(), duration);
    } else {
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
        this.bigWinAnim.visible = true;
        this.winTicker.countUpValue(appModel.getSpinWin(), this.totalDuration);
        this.playNextWinAnimation();
        this.intervalDelay = (this.totalDuration - 2000) / this.targetLevel;
        if (this.currentLevel < this.targetLevel - 1) {
          this.timeoutId = setTimeout(this.playEndAnimation.bind(this), this.intervalDelay);
        }
      }
    }
  }

  protected notifyWinDone(): void {
    StateManager.doNextStep();
  }
  public clearSpinWin(): void {
    clearTimeout(this.winTimerId);
    this.winTicker.reset();
    clearTimeout(this.timeoutId);
    this.bigWinAnim.stopAnimation();
    this.bigWinAnim.visible = false;
  }
  public showLineWin(): void {}

  protected playNextWinAnimation(): void {
    this.bigWinAnim.playAnimation({ state: this.configData.data.animations[this.currentState].start, loop: false });
  }
  protected onAnimComplete(data: any): void {
    if (data.animation.name === this.configData.data.animations[this.currentState].start) {
      this.bigWinAnim.playAnimation({ state: this.configData.data.animations[this.currentState].idle, loop: true });
    } else if (data.animation.name === this.configData.data.animations[this.currentState].end) {
      this.checkForNextAnim();
    }
  }

  protected onCountUpCompleted(): void {
    this.timeoutId = setTimeout(this.notifyWinDone.bind(this), 1000);
  }
  protected playEndAnimation(): void {
    this.bigWinAnim.playAnimation({ state: this.configData.data.animations[this.currentState].end, loop: false });
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
