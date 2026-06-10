import { SlotEvents } from '@core/events/SlotEvents';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { GameProxy } from '@core/models/GameConfigProxy';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixText } from '@core/pixiwrapper/PixText';
import { StateManager } from '@core/states/StateManagerService';
import { Util } from '@core/utils/UtilService';
import { ReelWinTicker } from '@core/views/comps/ReelWinTicker';

export class CascadeReelWinTicker extends ReelWinTicker {
  protected xText: PixText;
  protected multiplierText: PixText;
  protected multiplierTextVal: number = 0;

  constructor(config) {
    super(config);
    this.xText = this.elementsList['xText'];
    this.multiplierText = this.elementsList['multiplierText'];

    GameProxy.config.reelWintickerMultiplier = this.multiplierText;

    this.positionElements();
  }

  // overriding this to show "Total Win" string during cascade in FS
  protected showSpinWin(data: any): void {
    if (this.totalWin == 0) {
      AnimationProxy.fadeIn(this.winTicker, 0.25);
      this.winTicker.reset();
    }
    if (appModel.getIsAutoSession() && !appModel.isCascadeGame()) {
      return;
    }
    if (data.toShowTotalWin) {
      this.totalWin = data.value;
    } else {
      this.totalWin += data.value;
    }
    if (data.duration == 0) {
      this.winTicker.showSpinValue(this.totalWin, true, true);
    } else {
      this.winTicker.countUpValue(this.totalWin, data.duration, true);
    }

    this.visible = true;
    EventHandler.dispatchEvent(SlotEvents.REEL_WIN_TICKER_VISIBLE);
  }

  protected positionElements() {
    this.xText.alpha = 0;
    this.multiplierText.alpha = 0;

    const centerX = this.guideRect.width / 2;
    const centerY = this.guideRect.height / 2;

    this.winTicker.x = centerX;
    this.winTicker.y = centerY;

    this.xText.x = this.winTicker.x + this.winTicker.width / 4 + this.xText.width;
    this.xText.y = centerY;

    this.multiplierText.x = this.xText.x + this.xText.width;
    this.multiplierText.y = centerY;
  }

  public setupForAnimation() {
    this.positionElements();
    const xPos = this.winTicker.x - this.winTicker.width / 4;
    AnimationProxy.animateTween(this.winTicker, {
      x: xPos,
      duration: 0.6,
      ease: 'Linear.easeOut',
      onComplete: this.onWinTickerDone.bind(this),
    });
  }

  protected onWinTickerDone() {
    AnimationProxy.fadeIn(this.xText, 0.2);
  }

  public updateMultiplier(value: number) {
    this.multiplierTextVal += value;
    this.multiplierText.text = this.multiplierTextVal;
    this.multiplierText.alpha = 1;
  }

  public async animateToShowTotalWin(): Promise<void> {
    let xPos = this.winTicker.x;
    await Util.addDelays(400);
    AnimationProxy.fadeOut(this.xText, 0.2);
    AnimationProxy.animateTween(this.multiplierText, {
      x: xPos,
      alpha: 0,
      duration: 0.4,
      ease: 'Linear.easeOut',
      onComplete: this.onTextMoveDone.bind(this),
    });
    xPos = this.guideRect.width / 2;
    AnimationProxy.animateTween(this.winTicker, {
      x: xPos,
      duration: 0.6,
      ease: 'Linear.easeOut',
      onComplete: this.onFinalMovementDone.bind(this),
    });
    EventHandler.dispatchEvent(SlotEvents.PLAY_MULTIPLIER_TOTAL_WIN_SOUND);
  }

  protected onTextMoveDone() {
    this.emit(SlotEvents.UPDATE_TOTAL_MULTIPLIER);
    const value = appModel.getTotalCascadeWin();
    this.winTicker.showSpinValue(value, true, true);
    this.multiplierText.text = '';
    this.multiplierText.alpha = 0;
  }

  protected onFinalMovementDone() {
    this.positionElements();
    StateManager.doNextStep();
  }

  protected clearSpinWin() {
    super.clearSpinWin();
    this.multiplierTextVal = 0;
  }
}
