import { SlotEvents } from '@core/events/SlotEvents';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { StandardView } from '@core/pixiwrapper/StandardView';

export class CharacterController extends StandardView {
  private kingAnim: PixSpine;
  private idleLoopsRemaining = 0;
  private idleListenerAttached = false;
  private readonly idleMix = 0.3;
  private readonly idleAnims = ['idle', 'idle2'];
  private readonly winAnims = ['win', 'win4'];

  constructor(config) {
    super(config);
    this.kingAnim = this.elementsList['kingAnim'];
    EventHandler.addEventListener(SlotEvents.SHOW_TUMBLE_WIN, this.playRandomWinAnimations.bind(this));
    EventHandler.addEventListener(SlotEvents.SHOW_SPIN_WIN, this.playWinAnimationForBigWin.bind(this));
    this.playIdleAnimations();
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
      } else if (animName === this.idleAnims[1] || this.winAnims.includes(animName)) {
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

  private playRandomWinAnimations(): void {
    const randomAnim = this.winAnims[Math.floor(Math.random() * this.winAnims.length)];
    this.kingAnim.playAnimation({
      state: randomAnim,
      loop: false,
      defaultMix: this.idleMix,
      reset: false,
    });
  }

  private playWinAnimationForBigWin(): void {}

  private getRandomIdleLoopCount(): number {
    // 2-4 loops before idle2 plays once.
    return 2 + Math.floor(Math.random() * 3);
  }
}
