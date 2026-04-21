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
  private animCompleteListener: { complete: (entry) => void };
  private winTickerBW: WinTicker;
  private bigWinTextAnim: PixSpine;

  constructor(config) {
    super(config);
    this.winTicker = this.elementsList['winTicker'];
    this.winTickerBW = this.elementsList['winTickerBW'];
    this.winTicker?.reset();
    this.winTickerBW?.reset();
    this.showWinTickerType();
    this.winTickerBW?.on('COUNTUP_COMPLETED', this.onCountUpCompleted.bind(this));
    this.winTickerBW?.on('COUNTUP_UPDATE', this.onCountUpUpdateBW.bind(this));
    this.winTicker?.on('COUNTUP_COMPLETED', this.onCountUpCompleted.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_WIN_IN_REEL_FOR_SCATTER_WIN, this.showScatterWin.bind(this));

    this.skipRect = this.elementsList['skipRect'];
    UIUtil.addInteraction(this.skipRect, this.onSkipClicked.bind(this));
    UIUtil.setClickable(this.skipRect, true);
    this.skipRect.visible = false;
  }

  protected onSecondaryAssetsLoaded(): void {
    super.onSecondaryAssetsLoaded();
    this.bigWinAnim = UIUtil.getElement(this.configData.data.bigWinAnim);
    this.addChild(this.bigWinAnim, this.winTicker, this.winTickerBW, this.skipRect);

    if (this.bigWinAnim) {
      this.bigWinAnim.stopAnimation();
      this.bigWinAnim.visible = false;
      this.guideRect.alpha = 0;
      this.bigWinAnim.addEventListener('complete', this.onAnimComplete.bind(this));
    }
    if (this.configData.data.bigWinTextAnim) {
      this.bigWinTextAnim = UIUtil.getElement(this.configData.data.bigWinTextAnim);
      this.addChild(this.bigWinAnim, this.bigWinTextAnim, this.winTicker, this.winTickerBW, this.skipRect);
    }
    if (this.bigWinTextAnim) {
      this.bigWinTextAnim.stopAnimation();
      this.bigWinTextAnim.visible = false;
    }
  }

  protected showWinTickerType(type: string = 'normal'): void {
    console.log('showWinTickerType', type);
    if (type === 'normal') {
      this.winTicker.visible = true;
      this.winTickerBW.visible = false;
    } else {
      this.winTickerBW.visible = true;
      this.winTicker.visible = false;
    }
  }

  protected onSkipClicked() {
    if (this.winState && !this.isSkipping) {
      clearTimeout(this.timeoutId);
      clearTimeout(this.winTimerId);
      this.currentLevel = this.targetLevel - 1;
      this.currentState = STATES[this.currentLevel];
      this.isSkipping = true;

      if (this.bigWinAnim) {
        this.bigWinAnim.playAnimation({
          state: this.configData.data.animations[this.currentState].idle,
          loop: false,
          defaultMix: 0,
        });
      }
      if (this.bigWinTextAnim) {
        this.bigWinTextAnim.playAnimation({
          state: this.configData.data.textAnimations[this.currentState].idle,
          loop: false,
          defaultMix: 0,
        });
      }
      this.playCurrentBigWinSound();

      this.winTickerBW.skipToFinalValue();
      EventHandler.dispatchEvent(SlotEvents.SKIP_REELTICKER_WIN);
      EventHandler.dispatchEvent(SlotEvents.BIG_WIN_ANIM_COMPLETED);
    }
  }

  public async showTumbleWin() {
    EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
      value: appModel.getTumbleSpinWin(),
      duration: 0,
    });
  }

  protected async showScatterWin() {
    await this.showSpinWin();
  }

  public async showSpinWin() {
    const winType = appModel.getWinType();
    //const winType: string = CONSTANTS.UNBELIEVABLE_WIN;
    if (winType === CONSTANTS.BELOW_TOTALBET_WIN || winType === CONSTANTS.STANDARD_WIN) {
      const duration = 2000;
      clearTimeout(this.winTimerId);
      this.showWinTickerType();
      this.winTicker.showSpinValue(appModel.getSpinWin());
      this.winTimerId = setTimeout(() => this.notifyWinDone(), duration);
      EventHandler.dispatchEvent(SlotEvents.PLAY_STANDARD_WIN_SOUND);
    } else {
      EventHandler.dispatchEvent(SlotEvents.TOGGLE_REELTICKER_WIN, { show: false });
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
          if (this.configData.data.backgroundAlpha > 0) {
            this.guideRect.visible = true;
            this.guideRect.alpha = this.configData.data.backgroundAlpha;
          }
          this.bigWinAnim.visible = true;
        }
        if (this.bigWinTextAnim) {
          this.bigWinTextAnim.visible = true;
        }
        this.showWinTickerType('bigwin');
        this.winTickerBW.countUpValue(appModel.getSpinWin(), this.totalDuration);
        this.playNextWinAnimation();
        this.intervalDelay = (this.totalDuration - 1000) / this.targetLevel;
        if (!appModel.isCascadeGame()) {
          /*EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
            value: appModel.getSpinWin(),
            duration: this.totalDuration,
          });*/
        }
        if (this.currentLevel < this.targetLevel - 1) {
          this.timeoutId = setTimeout(this.playEndAnimation.bind(this), this.intervalDelay);
        }
      }
    }
  }

  protected notifyWinDone(): void {
    console.log('in notifyWinDone');
    EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
    EventHandler.dispatchEvent(SlotEvents.PLAY_BIG_WIN_TERMINATION_SOUND);
    EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    this.winState = false;
    this.skipRect.visible = false;
    this.isSkipping = false;
    clearTimeout(this.timeoutId);
    clearTimeout(this.winTimerId);
    EventHandler.dispatchEvent(SlotEvents.TOGGLE_REELTICKER_WIN, { show: true });
    EventHandler.dispatchEvent(SlotEvents.SHOW_REELTICKER_WIN, {
      value: appModel.getSpinWin(),
      duration: 0,
      toShowTotalWin: appModel.isCascadeGame(),
    });
    this.clearSpinWin();
    console.log('current state -- ', StateManager.currentState);
    StateManager.doNextStep();
  }
  public clearSpinWin(): void {
    if (this.winState) {
      EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
      EventHandler.dispatchEvent(SlotEvents.STOP_COUNT_UP_SOUND);
      EventHandler.dispatchEvent(SlotEvents.RESUME_BG_SOUND);
    }
    this.winState = false;
    this.skipRect.visible = false;
    clearTimeout(this.winTimerId);
    this.winTicker?.reset();
    this.winTickerBW?.reset();
    console.log('clearSpinWin');
    clearTimeout(this.timeoutId);
    this.showWinTickerType();
    this.isSkipping = false;
    if (this.bigWinAnim) {
      this.bigWinAnim?.stopAnimation();
      this.bigWinAnim.visible = false;
      this.guideRect.alpha = 0;
    }
    if (this.bigWinTextAnim) {
      this.bigWinTextAnim?.stopAnimation();
      this.bigWinTextAnim.visible = false;
    }
  }
  public showLineWin(): void {}

  protected playNextWinAnimation(): void {
    if (this.bigWinAnim) {
      this.bigWinAnim.playAnimation({
        state: this.configData.data.animations[this.currentState].start,
        loop: false,
        defaultMix: 0,
      });
    }
    if (this.bigWinTextAnim) {
      this.bigWinTextAnim.playAnimation({
        state: this.configData.data.textAnimations[this.currentState].start,
        loop: false,
        defaultMix: 0,
      });
    }
    this.playCurrentBigWinSound();
  }
  protected playCurrentBigWinSound(): void {
    EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
    EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    if (this.currentState === CONSTANTS.BIG_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_BIG_WIN_SOUND);
    } else if (this.currentState === CONSTANTS.MEGA_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_MEGA_WIN_SOUND);
    } else if (this.currentState === CONSTANTS.GIGANTIC_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_GIGANTIC_WIN_SOUND);
    } else if (this.currentState === CONSTANTS.UNBELIEVABLE_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_UNBELIEVABLE_WIN_SOUND);
    }
  }
  protected onAnimComplete(data: { animation: { name: string } }): void {
    const animations = this.configData.data.animations[this.currentState];
    console.log('onAnimComplete', this.isSkipping);
    if (this.isSkipping) {
      console.log('onAnimComplete skipping');
      if (data.animation.name === animations.idle) {
        if (animations.end) {
          if (this.bigWinAnim) {
            this.bigWinAnim.playAnimation({ state: animations.end, loop: false, reset: false, defaultMix: 0.15 });
          }
          if (this.bigWinTextAnim && this.configData.data.textAnimations[this.currentState].end) {
            this.bigWinTextAnim.playAnimation({
              state: this.configData.data.textAnimations[this.currentState].end,
              loop: false,
              reset: false,
              defaultMix: 0.15,
            });
          } else {
            this.notifyWinDone();
          }
        } else {
          this.notifyWinDone();
        }
      } else if (data.animation.name === animations.end) {
        this.notifyWinDone();
      }
      return;
    }
    if (data.animation.name === animations.start) {
      this.bigWinAnim.playAnimation({ state: animations.idle, loop: true, reset: false, defaultMix: 0 });
      if (this.bigWinTextAnim) {
        this.bigWinTextAnim.playAnimation({
          state: this.configData.data.textAnimations[this.currentState].idle,
          loop: true,
          reset: false,
          defaultMix: 0,
        });
      }
    } else if (data.animation.name === animations.end) {
      this.checkForNextAnim();
    }
  }

  protected onCountUpUpdateBW(): void {
    this.winTickerBW.scale.set(1);
    if (this.winTickerBW.width > this.guideRect.width * 0.9) {
      this.winTickerBW.scale.set((this.guideRect.width * 0.9) / this.winTickerBW.width);
    }
  }

  protected onCountUpCompleted(): void {
    clearTimeout(this.timeoutId);
    EventHandler.dispatchEvent(SlotEvents.BIG_WIN_ANIM_COMPLETED);
    const animations = this.configData.data.animations[this.currentState];
    if (animations.end) {
      if (this.bigWinAnim) {
        this.bigWinAnim.playAnimation({ state: animations.end, loop: false, reset: false, defaultMix: 0.15 });
      }
      if (this.bigWinTextAnim && this.configData.data.textAnimations[this.currentState].end) {
        this.bigWinTextAnim.playAnimation({
          state: this.configData.data.textAnimations[this.currentState].end,
          loop: false,
          reset: false,
          defaultMix: 0.15,
        });
      }
    } else {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      this.timeoutId = setTimeout(this.notifyWinDone.bind(this), 1000);
    }
  }
  protected playEndAnimation(): void {
    if (this.bigWinAnim) {
      if (this.configData.data.animations[this.currentState].end) {
        this.bigWinAnim.playAnimation({
          state: this.configData.data.animations[this.currentState].end,
          loop: false,
          reset: false,
          defaultMix: 0.15,
        });
      } else {
        this.checkForNextAnim();
      }
      if (this.bigWinTextAnim) {
        if (this.configData.data.textAnimations[this.currentState].end) {
          this.bigWinTextAnim.playAnimation({
            state: this.configData.data.textAnimations[this.currentState].end,
            loop: false,
            reset: false,
            defaultMix: 0.15,
          });
        }
      }
    } else {
      this.checkForNextAnim();
    }
  }
  protected checkForNextAnim() {
    this.currentLevel++;
    console.log('xxxxxxxxxxxxx -- ', this.currentLevel, this.targetLevel);
    if (this.currentLevel >= this.targetLevel) {
      console.log('bbbbbbbbbbbbbbbbbbb');
      this.notifyWinDone();
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
