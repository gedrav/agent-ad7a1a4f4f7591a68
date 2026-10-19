import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

const TRANSITION_DURATION = 0.5;
const TRANSITION_EASE = 'power2.inOut';

export class TransitionComp extends ResponsiveChildrenView {
  private readonly transitionScreen1: PixSprite;
  private readonly transitionScreen2: PixSprite;

  constructor(config: any) {
    super(config);
    this.transitionScreen1 = this.elementsList['transitionScreen1'];
    this.transitionScreen2 = this.elementsList['transitionScreen2'];

    this.transitionScreen1.x = config.data.transitionScreen1.initialPos;
    this.transitionScreen2.x = config.data.transitionScreen2.initialPos;

    this.visible = false;

    EventHandler.addEventListener(SlotEvents.SHOW_TRANSITION_ANIM, this.onShowTransition.bind(this));
  }

  private onShowTransition(): void {
    this.visible = true;
    this.playTransitionAnim();
  }

  private playTransitionAnim(): void {
    const data = this.configData.data;
    AnimationProxy.animateTween(this.transitionScreen1, {
      x: data.transitionScreen1.finalPos,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
    });
    AnimationProxy.animateTween(this.transitionScreen2, {
      x: data.transitionScreen2.finalPos,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
      onComplete: this.onTransitionComplete.bind(this),
    });
  }

  private onTransitionComplete(): void {
    if (!this.visible) return;
    this.visible = false;
    const data = this.configData.data;
    this.transitionScreen1.x = data.transitionScreen1.initialPos;
    this.transitionScreen2.x = data.transitionScreen2.initialPos;
    StateManager.doNextStep();
  }
}
