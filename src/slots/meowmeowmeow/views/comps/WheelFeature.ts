import { MessageProxy } from '@brand/models/MessageServiceProxy';
import { SlotEvents } from '@core/events/SlotEvents';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { STATES } from '@core/states/StateConstants';
import { StateManager } from '@core/states/StateManagerService';
import { GAMESTATES } from '@slots/meowmeowmeow/states/GameStates';

type SpinState = 'idle' | 'spinning' | 'stopping';

export class WheelFeatureComp extends ResponsiveChildrenView {
  private readonly wheelBG: PixSprite;
  private readonly numberOfSectors: number = 10;
  private readonly radiansPerSector: number = (Math.PI * 2) / this.numberOfSectors;
  private isSpinning: boolean = false;
  private spinState: SpinState = 'idle';
  private iteration: number = 0;
  private readonly maxSpinDuration: number = 5000;
  private readonly lateStopDuration: number = 600;
  private readonly minDecelDuration: number = 400;
  private readonly continuousSpeed: number = (Math.PI * 2) / 1000;
  private lastFrameTime: number = 0;
  private spinStartTime: number = 0;
  private wheelWinnings: string = '';

  // TODO: Map wheel sectors with response
  // private featureMpa = {
  //     0: '',
  //     1: '',
  //     2: '',
  //     3: '',
  //     4: '',
  //     5: '',
  //     6: '',
  //     7: '',
  //     8: '',
  //     9: '',
  //     10: '',
  // };

  constructor(config: any) {
    super(config);
    this.wheelBG = this.elementsList['wheelBG'];
    this.wheelBG.x = 0;
    this.wheelBG.y = 0;
    this.visible = false;
    this.renderable = false;
    this.interactive = false;
    this.resizeView();
    this.onpointerdown = async () => {
      this.spinWheel();
      await MessageProxy.requestBonusData(appModel.getFeatureType());
      const wheelResult = appModel.featureResult;
      this.wheelWinnings =
        wheelResult.prizeValue === 'Green_Coin_Feature'
          ? 'Green'
          : wheelResult.prizeValue === 'Red_Coin_Feature'
            ? 'Red'
            : wheelResult.prizeValue;
      console.warn(this.wheelWinnings);
      setTimeout(() => {
        const choosenSector = this.getRandomInt(0, this.numberOfSectors - 1);
        this.stopWheel(choosenSector);
      }, 2000);
    };
  }

  private finalPosition(choosenSector: number): number {
    const sectorsToMinus = this.numberOfSectors - choosenSector;
    const rotation = sectorsToMinus * this.radiansPerSector;
    return rotation;
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private velocityMatchedEaseOut(t: number, k: number): number {
    return (k - 2) * t ** 3 + (3 - 2 * k) * t ** 2 + k * t;
  }

  // private easeOutSharp(t) {
  //   return Math.sqrt(1 - Math.pow(t - 1, 2));
  // }

  public spinWheel(): void {
    if (this.isSpinning) {
      return;
    }

    this.isSpinning = true;
    this.spinState = 'spinning';
    this.interactive = false;

    const now = performance.now();
    this.spinStartTime = now;
    this.lastFrameTime = now;

    requestAnimationFrame(this.freeSpinTick);
  }

  private readonly freeSpinTick = (now: number): void => {
    if (this.spinState !== 'spinning') {
      return;
    }

    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.wheelBG.rotation += this.continuousSpeed * delta;

    requestAnimationFrame(this.freeSpinTick);
  };

  public stopWheel(choosenSector: number): void {
    if (this.spinState !== 'spinning') {
      return;
    }
    if (choosenSector < 0 || choosenSector >= this.numberOfSectors) {
      console.warn(`WheelFeatureComp: invalid Response ${choosenSector}`);
      return;
    }

    this.spinState = 'stopping';

    const now = performance.now();
    const elapsedSinceStart = now - this.spinStartTime;

    const duration =
      elapsedSinceStart < this.maxSpinDuration
        ? Math.max(this.maxSpinDuration - elapsedSinceStart, this.minDecelDuration)
        : this.lateStopDuration;

    const startRotation = this.wheelBG.rotation % (Math.PI * 2);
    this.wheelBG.rotation = startRotation;

    const targetRotation = this.finalPosition(choosenSector);

    let deltaToTarget = (targetRotation - startRotation) % (Math.PI * 2);
    if (deltaToTarget < 0) {
      deltaToTarget += Math.PI * 2;
    }

    const naturalDistance = 0.5 * this.continuousSpeed * duration;

    let extraFullSpins = Math.round((naturalDistance - deltaToTarget) / (Math.PI * 2));
    if (extraFullSpins < 0) {
      extraFullSpins = 0;
    }

    const totalRotation = extraFullSpins * Math.PI * 2 + deltaToTarget;

    let k = totalRotation > 0 ? (this.continuousSpeed * duration) / totalRotation : 2;
    k = Math.min(Math.max(k, 1.5), 2);

    const startTime = now;

    const animateStop = (frameNow: number): void => {
      const elapsed = frameNow - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.velocityMatchedEaseOut(progress, k);

      this.wheelBG.rotation = startRotation + totalRotation * eased;

      if (progress < 1) {
        requestAnimationFrame(animateStop);
      } else {
        this.wheelBG.rotation = startRotation + deltaToTarget;
        this.isSpinning = false;
        this.spinState = 'idle';
        this.interactive = true;
        this.iteration++;
        this.onSpinComplete(choosenSector);
      }
    };

    requestAnimationFrame(animateStop);
  }

  private onSpinComplete(choosenSector: number): void {
    this.visible = false;
    this.renderable = false;
    this.interactive = false;

    if (this.wheelWinnings === 'Green') {
      StateManager.goToState(GAMESTATES.GREEN_ENTER_FREESPINS_STATE);
    } else if (this.wheelWinnings === 'Red') {
      // createOne
      // StateManager.goToState(GAMESTATES.RED_ENTER_FREESPINS_STATE);
    } else {
      StateManager.goToState(STATES.COMPLETE_GAMEROUND_STATE);
    }
  }

  public resizeView(): void {
    super.resizeView();
  }
}
