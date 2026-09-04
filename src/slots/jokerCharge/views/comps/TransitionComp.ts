import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';

export class TransitionComp extends ResponsiveView {
  private readonly transitionAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.transitionAnim = this.elementsList['transitionAnim'];
    EventHandler.addEventListener(JCEvents.PLAY_TRANSITION, this.playTransition.bind(this));
  }

  public playTransition(): void {
    // Must come after playAnimation() - it resets state.timeScale to 1 every time it runs.
    this.transitionAnim.playAnimation({ state: 'animation', loop: false });
    this.transitionAnim.setAnimationSpeed(0.75);
  }
}
