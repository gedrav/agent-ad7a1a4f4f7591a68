import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { appModel } from '@core/models/services/AppModelService';
import { CONSTANTS } from '@core/utils/CONSTANTS';

export class CharacterController extends StandardView {
  private kingAnim: PixSpine;
  private idleLoopsRemaining = 0;
  private idleListenerAttached = false;
  private readonly idleMix = 0.3;
  private readonly normalWinMix = 0.05;
  private readonly idleAnims = ['idle', 'idle2'];
  private readonly noWinAnims = ['fall'];
  private readonly smallWinAnims = ['win'];
  private readonly normalWinAnims = ['win1', 'win2'];
  private readonly highPayWinAnims = ['win3'];
  private readonly bigWinAnims = ['win4'];
  private readonly symbolConversionAnims = ['Lifting_Sword'];
  private noWinSpinCount = 0;
  private noWinThreshold: number;

  constructor(config) {
    super(config);
    this.kingAnim = this.elementsList['kingAnim'];
    this.noWinThreshold = this.getRandomNoWinThreshold();
    EventHandler.addEventListener(SlotEvents.SHOW_TUMBLE_WIN, this.playRandomWinAnimations.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.playWinAnimationForBigWin.bind(this));

    EventHandler.addEventListener(SlotEvents.START_SPIN, this.resetCharacterAnimation.bind(this));
    EventHandler.addEventListener(SlotEvents.REELSPIN_COMPLETED, this.playRandomNoWinAnimaions.bind(this));
    EventHandler.addEventListener(SlotEvents.LOWPAY_SYMBOL_CONVERSION, this.playAnimBeforeSymbolConversion.bind(this));

    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_START, this.onFSStart.bind(this));
    EventHandler.addEventListener(SlotEvents.FREESPINS_UPDATE_UI_END, this.onFSEnd.bind(this));

    this.playIdleAnimations();
  }

  protected onFSStart(): void {
    this.kingAnim.setSkin('free_spin');
  }
  protected onFSEnd(): void {
    this.kingAnim.setSkin('main');
  }
  private playIdleAnimations(): void {
    this.idleLoopsRemaining = this.getRandomIdleLoopCount();

    this.kingAnim.playAnimation({
      state: 'idle',
      loop: true,
      defaultMix: this.idleMix,
    });

    if (this.idleListenerAttached) return;
    this.idleListenerAttached = true;
    this.kingAnim.addEventListener('complete', (entry: any) => {
      const animName = entry?.animation?.name;
      if (animName === this.idleAnims[0]) {
        this.idleLoopsRemaining--;
        if (this.idleLoopsRemaining <= 0) {
          this.kingAnim.playAnimation({
            state: this.idleAnims[1],
            loop: false,
            defaultMix: this.idleMix,
            reset: false,
          });
        }
      } else if (
        animName === this.idleAnims[1] ||
        this.noWinAnims.includes(animName) ||
        this.smallWinAnims.includes(animName) ||
        this.normalWinAnims.includes(animName) ||
        this.highPayWinAnims.includes(animName) ||
        this.bigWinAnims.includes(animName) ||
        this.symbolConversionAnims.includes(animName)
      ) {
        this.idleLoopsRemaining = this.getRandomIdleLoopCount();
        this.kingAnim.playAnimation({
          state: this.idleAnims[0],
          loop: true,
          defaultMix: this.idleMix,
          reset: false,
        });
      }
    });
  }

  private playRandomNoWinAnimaions(): void {
    if (appModel.getSpinWin() > 0) return;
    this.noWinSpinCount++;
    if (this.noWinSpinCount < this.noWinThreshold) return;

    this.noWinSpinCount = 0;
    this.noWinThreshold = this.getRandomNoWinThreshold();

    const randomAnim = this.noWinAnims[Math.floor(Math.random() * this.noWinAnims.length)];
    this.kingAnim.playAnimation({
      state: randomAnim,
      loop: false,
      defaultMix: this.idleMix,
      reset: false,
    });
  }

  private playRandomWinAnimations(): void {
    // playing if tumble happens
    const tumbleData: any[] = appModel.getSpinBlastData();
    const doesWinContainHPSymb = tumbleData.some((e) => e.symbol.includes('H'));
    if (doesWinContainHPSymb) {
      const randomAnim = this.highPayWinAnims[Math.floor(Math.random() * this.highPayWinAnims.length)];
      this.kingAnim.playAnimation({
        state: randomAnim,
        loop: false,
        defaultMix: this.idleMix,
        reset: false,
      });
    } else {
      const winType = appModel.getSingleCascadeWinType();
      if (winType === CONSTANTS.BELOW_TOTALBET_WIN) {
        const randomAnim = this.smallWinAnims[Math.floor(Math.random() * this.smallWinAnims.length)];
        this.kingAnim.playAnimation({
          state: randomAnim,
          loop: false,
          defaultMix: this.idleMix,
          reset: false,
        });
      } else {
        const randomAnim = this.normalWinAnims[Math.floor(Math.random() * this.normalWinAnims.length)];
        this.kingAnim.playAnimation({
          state: randomAnim,
          loop: false,
          defaultMix: this.normalWinMix,
          reset: false,
        });
      }
    }
  }

  private playWinAnimationForBigWin(): void {
    // playing while showing the big win animation
    const winType = appModel.getWinType();
    if (winType === CONSTANTS.BELOW_TOTALBET_WIN || winType === CONSTANTS.STANDARD_WIN) return;
    const randomAnim = this.bigWinAnims[Math.floor(Math.random() * this.bigWinAnims.length)];
    this.kingAnim.playAnimation({
      state: randomAnim,
      loop: false,
      defaultMix: this.idleMix,
      reset: false,
    });
  }

  private playAnimBeforeSymbolConversion(): void {
    //play before symbol conversion animation
    const randomAnim = this.symbolConversionAnims[Math.floor(Math.random() * this.symbolConversionAnims.length)];
    this.kingAnim.playAnimation({
      state: randomAnim,
      loop: false,
      defaultMix: this.idleMix,
      reset: false,
    });
    setTimeout(() => {
      EventHandler.dispatchEvent(SlotEvents.CHARACTER_SYMBOL_CONVERSION_ANIM_COMPLETE);
    }, 1000); // Assuming the symbol conversion animation is 1 second long. Adjust as needed.
  }

  private resetCharacterAnimation(): void {
    this.idleLoopsRemaining = this.getRandomIdleLoopCount();
    this.kingAnim.playAnimation({
      state: this.idleAnims[0],
      loop: true,
      defaultMix: this.idleMix,
      reset: false,
    });
  }

  private getRandomIdleLoopCount(): number {
    // 2-4 loops before idle2 plays once.
    return 2 + Math.floor(Math.random() * 3);
  }

  private getRandomNoWinThreshold(): number {
    // 3-6 no-win spins before no-win anim plays.
    return 3 + Math.floor(Math.random() * 4);
  }
}
