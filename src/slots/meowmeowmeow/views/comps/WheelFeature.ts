import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { StateManager } from '@core/states/StateManagerService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { Util } from '@core/utils/UtilService';
import gsap from 'gsap';

type SpinState = 'idle' | 'spinning' | 'stopping';

const RESULT_STOP_DELAY = 2000;
const TAP_TEXT_PULSE_DURATION = 0.6;
const TAP_TEXT_PULSE_SCALE = 1.15;
const TAP_TEXT_HIDE_DURATION = 0.3;
const TAP_TEXT_HIDE_SCALE = 0.5;

export class WheelFeatureComp extends ResponsiveChildrenView {
  private readonly wheelBG: PixSpine;
  private readonly wheelBorder: PixSpine;
  private readonly glowEffect: PixSpine;
  private readonly wheelBordeTop: PixSpine;
  private readonly tapText: any;
  private tapTextScaleTween: gsap.core.Tween | null = null;

  private readonly numberOfSectors: number = 10;
  private readonly radiansPerSector: number = (Math.PI * 2) / this.numberOfSectors;
  private readonly maxSpinDuration: number = 5000;
  private readonly lateStopDuration: number = 600;
  private readonly minDecelDuration: number = 400;
  private readonly continuousSpeed: number = (Math.PI * 2) / 1000;

  private isSpinning: boolean = false;
  private spinState: SpinState = 'idle';
  private iteration: number = 0;
  private lastFrameTime: number = 0;
  private spinStartTime: number = 0;
  private wheelWinnings: string = '';

  private readonly resultToStopIndexMap: Record<string, number> = {
    '15': 0,
    Red: 1,
    '8': 2,
    '10': 3,
    '80': 4,
    '5': 5,
    '120': 6,
    Green: 7,
    '40': 8,
    '25': 9,
  };

  private readonly animationMap: Record<number, string> = {
    0: '15',
    1: 'Red_Cat',
    2: '08',
    3: '10',
    4: '80',
    5: '05',
    6: '120',
    7: 'Green_Cat',
    8: '40',
    9: '25',
  };

  constructor(config: any) {
    super(config);
    this.wheelBG = this.elementsList['Wheel_BG'];
    this.wheelBG.setInteractive(true);
    this.wheelBorder = this.elementsList['Wheel_Border'];
    this.glowEffect = this.elementsList['Wheel_Glow'];
    this.wheelBordeTop = this.elementsList['Wheel_Topper'];
    this.tapText = this.elementsList['tapText'];
    EventHandler.addEventListener('SHOW_PICK_FEATURE_TRANSITION', this.showText.bind(this));
    this.initView();
    this.bindEvents();
    this.resizeView();
  }

  private showText() {
    this.tapText.visible = true;
    this.killTapTextTweens();
    this.tapTextScaleTween = AnimationProxy.animateTween(this.tapText.scale, {
      x: TAP_TEXT_PULSE_SCALE,
      y: TAP_TEXT_PULSE_SCALE,
      duration: TAP_TEXT_PULSE_DURATION,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private hideTapText(): void {
    this.killTapTextTweens();
    AnimationProxy.animateTween(this.tapText, {
      alpha: 0,
      duration: TAP_TEXT_HIDE_DURATION,
      ease: 'sine.in',
      onComplete: () => {
        this.tapText.visible = false;
        this.tapText.alpha = 1;
        this.tapText.scale.set(1);
      },
    });
    AnimationProxy.animateTween(this.tapText.scale, {
      x: TAP_TEXT_HIDE_SCALE,
      y: TAP_TEXT_HIDE_SCALE,
      duration: TAP_TEXT_HIDE_DURATION,
      ease: 'sine.in',
      onComplete: () => {
        this.tapText.scale.set(1);
      },
    });
  }

  private killTapTextTweens(): void {
    this.tapTextScaleTween?.kill();
    this.tapTextScaleTween = null;
    this.tapText.alpha = 1;
    this.tapText.scale.set(1);
  }

  // ---------- Setup ----------

  private initView(): void {
    this.wheelBorder.playAnimation({ state: 'outer_ring', loop: true });
    this.wheelBG.playAnimation({ state: 'inner_circle', loop: true });
    this.wheelBordeTop.playAnimation({ state: 'arrow', loop: true });
    this.glowEffect.playAnimation({ state: 'FX_loop', loop: true });
    this.glowEffect.visible = false;

    this.visible = false;
    this.renderable = false;
    this.interactive = false;

    this.tapText.text = Util.getContent('TapToSpinWheelText');
  }

  private bindEvents(): void {
    this.onpointerdown = this.handleWheelTap;
  }

  private readonly handleWheelTap = async (): Promise<void> => {
    this.hideTapText();
    this.spinWheel();

    const choosenSector = await this.resolveWinningSector();
    await this.stopWheel(choosenSector);
  };

  private async fetchBonusData(): Promise<void> {
    const featureType = appModel.getIsUnfinishedGame()
      ? appModel.getUnfinishedFeatureType()
      : appModel.getFeatureType();
    await MessageProxy.requestBonusData(featureType);
  }

  private async resolveWinningSector(): Promise<number> {
    await this.fetchBonusData();

    const wheelResult = appModel.featureResult.featureData;
    this.wheelWinnings = this.normalizePrizeValue(wheelResult.prizeValue);

    return this.resultToStopIndexMap[this.wheelWinnings];
  }

  private normalizePrizeValue(prizeValue: string): string {
    if (prizeValue === 'Green_Coin_Feature') return 'Green';
    if (prizeValue === 'Red_Coin_Feature') return 'Red';
    return prizeValue;
  }

  // ---------- Spin math ----------

  private finalPosition(choosenSector: number): number {
    const sectorsToMinus = this.numberOfSectors - choosenSector;
    return sectorsToMinus * this.radiansPerSector;
  }

  private velocityMatchedEaseOut(t: number, k: number): number {
    return (k - 2) * t ** 3 + (3 - 2 * k) * t ** 2 + k * t;
  }

  // ---------- Spin lifecycle ----------

  public spinWheel(): void {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.spinState = 'spinning';
    this.interactive = false;

    EventHandler.dispatchEvent('PLAY_WHEEL_SPIN_SOUND');

    const now = performance.now();
    this.spinStartTime = now;
    this.lastFrameTime = now;

    requestAnimationFrame(this.freeSpinTick);
  }

  private readonly freeSpinTick = (now: number): void => {
    if (this.spinState !== 'spinning') return;

    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.wheelBG.rotation += this.continuousSpeed * delta;

    requestAnimationFrame(this.freeSpinTick);
  };

  public stopWheel(choosenSector: number): void {
    if (this.spinState !== 'spinning') return;

    if (choosenSector < 0 || choosenSector >= this.numberOfSectors) {
      console.warn(`WheelFeatureComp: invalid Response ${choosenSector}`);
      return;
    }

    this.spinState = 'stopping';

    const { duration, startRotation, targetRotation } = this.computeStopParams(choosenSector);
    const deltaToTarget = this.shortestDelta(startRotation, targetRotation);
    const totalRotation = this.computeTotalRotation(duration, deltaToTarget);
    const k = this.computeEasingK(duration, totalRotation);

    this.wheelBG.rotation = startRotation;

    const startTime = performance.now();

    const animateStop = (frameNow: number): void => {
      const elapsed = frameNow - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.velocityMatchedEaseOut(progress, k);

      this.wheelBG.rotation = startRotation + totalRotation * eased;

      if (progress < 1) {
        requestAnimationFrame(animateStop);
      } else {
        this.finishStop(startRotation, deltaToTarget, choosenSector);
      }
    };

    requestAnimationFrame(animateStop);
  }

  private computeStopParams(choosenSector: number): {
    duration: number;
    startRotation: number;
    targetRotation: number;
  } {
    const now = performance.now();
    const elapsedSinceStart = now - this.spinStartTime;

    const duration =
      elapsedSinceStart < this.maxSpinDuration
        ? Math.max(this.maxSpinDuration - elapsedSinceStart, this.minDecelDuration)
        : this.lateStopDuration;

    const startRotation = this.wheelBG.rotation % (Math.PI * 2);
    const targetRotation = this.finalPosition(choosenSector);

    return { duration, startRotation, targetRotation };
  }

  private shortestDelta(startRotation: number, targetRotation: number): number {
    let delta = (targetRotation - startRotation) % (Math.PI * 2);
    if (delta < 0) delta += Math.PI * 2;
    return delta;
  }

  private computeTotalRotation(duration: number, deltaToTarget: number): number {
    const naturalDistance = 0.5 * this.continuousSpeed * duration;
    const extraFullSpins = Math.max(Math.round((naturalDistance - deltaToTarget) / (Math.PI * 2)), 0);
    return extraFullSpins * Math.PI * 2 + deltaToTarget;
  }

  private computeEasingK(duration: number, totalRotation: number): number {
    const k = totalRotation > 0 ? (this.continuousSpeed * duration) / totalRotation : 2;
    return Math.min(Math.max(k, 1.5), 2);
  }

  private finishStop(startRotation: number, deltaToTarget: number, choosenSector: number): void {
    this.wheelBG.rotation = startRotation + deltaToTarget;

    this.isSpinning = false;
    this.spinState = 'idle';
    this.hideTapText();
    this.iteration++;

    this.onSpinComplete(choosenSector);
  }

  private onSpinComplete(choosenSector: number): void {
    EventHandler.dispatchEvent('PLAY_WHEEL_WIN_SOUND');
    const animName = this.animationMap[choosenSector];

    this.wheelBG.playAnimation({ state: animName, loop: true });
    this.glowEffect.visible = true;
    setTimeout(() => {
      this.glowEffect.visible = false;
      this.wheelBG.playAnimation({ state: 'inner_circle', loop: true });
      StateManager.next();
    }, 3500);
  }

  public resizeView(): void {
    super.resizeView();
  }
}
