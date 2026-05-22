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
import 'pixi.js/prepare';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

let bigWinTextScales: number[] = [0.8, 0.8, 0.9, 1];
const STATES: string[] = [CONSTANTS.BIG_WIN, CONSTANTS.SUPER_WIN, CONSTANTS.MEGA_WIN, CONSTANTS.EPIC_WIN];
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
  private bigWinPanelAnim: PixSpine;
  private bigWinText: PixSprite;

  constructor(config) {
    super(config);
    this.winTicker = this.elementsList['winTicker'];
    this.winTickerBW = this.elementsList['winTickerBW'];
    this.bigWinText = this.elementsList['bigWinText'];
    if (this.bigWinText) {
      this.bigWinText.visible = false;
    }
    if (this.configData.data.bigWinTextScales) {
      bigWinTextScales = this.configData.data.bigWinTextScales;
    }
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

  async onSecondaryAssetsLoaded() {
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

    if (this.configData.data.bigWinPanelAnim) {
      this.bigWinPanelAnim = UIUtil.getElement(this.configData.data.bigWinPanelAnim);
      this.addChild(
        this.bigWinPanelAnim,
        this.bigWinAnim,
        this.bigWinTextAnim,
        this.winTicker,
        this.winTickerBW,
        this.skipRect,
      );
    }
    if (this.bigWinTextAnim) {
      this.bigWinTextAnim.stopAnimation();
      this.bigWinTextAnim.visible = false;
    }
    if (this.bigWinPanelAnim) {
      this.bigWinPanelAnim.stopAnimation();
      this.bigWinPanelAnim.visible = false;
    }
    if (this.bigWinText) {
      this.addChild(this.bigWinText);
    }
  }

  protected showWinTickerType(type: string = 'normal'): void {
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
      if (this.bigWinText) {
        this.bigWinText.texture = UIUtil.getTexture(this.configData.data.bigWinTextStates[this.currentState]);
        const targetScale = this.resizeBigwinText();
        this.bigWinText.scale.set(targetScale);
      }
      if (this.bigWinPanelAnim) {
        this.bigWinPanelAnim.playAnimation({
          state: this.configData.data.panelAnimations[this.currentState].idle,
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
    if (winType === CONSTANTS.BELOW_TOTALBET_WIN || winType === CONSTANTS.STANDARD_WIN) {
      const duration = 2000;
      clearTimeout(this.winTimerId);
      this.showWinTickerType();
      this.winTicker.showSpinValue(appModel.getSpinWin());
      this.winTimerId = setTimeout(() => this.notifyWinDone(), duration);
      if (winType === CONSTANTS.BELOW_TOTALBET_WIN) {
        EventHandler.dispatchEvent(SlotEvents.PLAY_STANDARD_WIN_SOUND);
      } else {
        EventHandler.dispatchEvent(SlotEvents.PLAY_PREMIUM_WIN_SOUND);
      }
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
        case CONSTANTS.SUPER_WIN:
          this.targetLevel = 2;
          this.totalDuration = 6000;
          break;
        case CONSTANTS.MEGA_WIN:
          this.targetLevel = 3;
          this.totalDuration = 8000;
          break;
        case CONSTANTS.EPIC_WIN:
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
        if (this.bigWinText) {
          this.bigWinText.visible = true;
        }
        if (this.bigWinPanelAnim) {
          this.bigWinPanelAnim.visible = true;
        }
        if (this.bigWinPanelAnim) {
          this.bigWinPanelAnim.playAnimation({
            state: this.configData.data.panelAnimations[this.currentState].idle,
            loop: true,
            defaultMix: 0,
          });
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
    if (this.bigWinText) {
      AnimationProxy.killTweensOf(this.bigWinText);
      this.bigWinText.visible = false;
      this.bigWinText.texture = UIUtil.getTexture(this.configData.data.bigWinTextStates.BIG_WIN);
    }
    if (this.bigWinPanelAnim) {
      this.bigWinPanelAnim?.stopAnimation();
      this.bigWinPanelAnim.visible = false;
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
    if (this.bigWinText) {
      this.animateBigWinText();
    }
    this.playCurrentBigWinSound();
  }

  protected animateBigWinText(): void {
    AnimationProxy.killTweensOf(this.bigWinText);

    if (this.currentLevel === 0) {
      this.bigWinText.alpha = 1;
      const targetScale = this.resizeBigwinText();
      AnimationProxy.animateFromTo(
        this.bigWinText,
        0.2,
        { scaleX: 0, scaleY: 0 },
        {
          scaleX: targetScale,
          scaleY: targetScale,
          onComplete: () => {
            AnimationProxy.animateTween(this.bigWinText, {
              scaleX: targetScale * 0.95,
              scaleY: targetScale * 0.95,
              repeat: -1,
              yoyo: true,
              duration: 0.5,
            });
          },
        },
      );
      return;
    }

    AnimationProxy.animateTween(this.bigWinText, {
      duration: 0.25,
      scaleX: 0.1,
      scaleY: 0.1,
      onComplete: () => {
        this.bigWinText.texture = UIUtil.getTexture(this.configData.data.bigWinTextStates[this.currentState]);
        const targetScale = this.resizeBigwinText();
        this.bigWinText.scale.set(targetScale * 0.5);
        AnimationProxy.animateTween(this.bigWinText, {
          duration: 0.25,
          scaleX: targetScale,
          scaleY: targetScale,
          onComplete: () => {
            AnimationProxy.animateTween(this.bigWinText, {
              scaleX: targetScale * 0.95,
              scaleY: targetScale * 0.95,
              repeat: -1,
              yoyo: true,
              duration: 0.5,
            });
          },
        });
      },
    });
  }

  protected playCurrentBigWinSound(): void {
    EventHandler.dispatchEvent(SlotEvents.STOP_BIG_WIN_SOUND);
    EventHandler.dispatchEvent(SlotEvents.STOP_BG_SOUND);
    if (this.currentState === CONSTANTS.BIG_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_BIG_WIN_SOUND);
    } else if (this.currentState === CONSTANTS.SUPER_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_SUPER_WIN_SOUND);
    } else if (this.currentState === CONSTANTS.MEGA_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_MEGA_WIN_SOUND);
    } else if (this.currentState === CONSTANTS.EPIC_WIN) {
      EventHandler.dispatchEvent(SlotEvents.PLAY_EPIC_WIN_SOUND);
    }
  }
  protected onAnimComplete(data: { animation: { name: string } }): void {
    const animations = this.configData.data.animations[this.currentState];
    if (this.isSkipping) {
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
          } else if (this.bigWinText) {
            AnimationProxy.animateTween(this.bigWinText, {
              duration: 0.2,
              scaleX: 0.1,
              scaleY: 0.1,
              alpha: 0,
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
      if (this.bigWinText) {
        AnimationProxy.animateTween(this.bigWinText, {
          duration: 0.2,
          scaleX: 0.1,
          scaleY: 0.1,
          alpha: 0,
        });
      }
    } else {
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
    if (this.currentLevel >= this.targetLevel) {
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
  protected resizeBigwinText(): number {
    if (!this.bigWinText || !this.guideRect) return 1;
    this.bigWinText.scale.set(1);
    const maxWidth = this.guideRect.width * 0.96;
    const scaleX =
      (this.bigWinText.width > maxWidth ? maxWidth / this.bigWinText.width : 1) * bigWinTextScales[this.currentLevel];
    return scaleX;
  }
}
