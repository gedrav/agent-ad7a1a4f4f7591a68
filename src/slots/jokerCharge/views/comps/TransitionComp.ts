import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { AnimationStateListener } from '@esotericsoftware/spine-pixi-v8';

export class TransitionComp extends ResponsiveView {
  private readonly transitionAnim: PixSpine;
  private completeListener: AnimationStateListener | null = null;

  constructor(config: any) {
    super(config);
    this.transitionAnim = this.elementsList['transitionAnim'];
    // A Spine ticks its own skeleton every frame via Ticker.shared regardless of visible - this
    // sits idle almost all of the time, so autoUpdate stays off except while actually playing.
    this.transitionAnim.setAutoUpdate(false);
    EventHandler.addEventListener(JCEvents.PLAY_TRANSITION, this.playTransition.bind(this));
  }

  public playTransition(): void {
    this.transitionAnim.setAutoUpdate(true);
    if (this.completeListener) this.transitionAnim.removeSpineEvent(this.completeListener);
    this.completeListener = this.transitionAnim.addEventListener('complete', () => {
      this.transitionAnim.setAutoUpdate(false);
    });
    // Must come after playAnimation() - it resets state.timeScale to 1 every time it runs.
    this.transitionAnim.playAnimation({ state: 'animation', loop: false });
    this.transitionAnim.setAnimationSpeed(0.75);
  }
}
