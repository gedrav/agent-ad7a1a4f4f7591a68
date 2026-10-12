import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { appModel } from '@core/models/services/AppModelService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class TransitionAnimComp extends ResponsiveChildrenView {
  private readonly transitionAnim: PixSpine;
  private coverTimeoutId: any;

  constructor(config: any) {
    super(config);
    this.transitionAnim = this.elementsList['transitionAnim'];

    this.transitionAnim.addEventListener('complete', this.onTransitionComplete.bind(this));

    this.visible = false;
    this.hideTransitionAnim();

    EventHandler.addEventListener(SlotEvents.SHOW_TRANSITION_ANIM, this.onShowTransition.bind(this));
  }

  private hideTransitionAnim(): void {
    this.transitionAnim.renderable = false;
  }

  private onShowTransition(): void {
    this.visible = true;
    this.playTransitionAnim();
    clearTimeout(this.coverTimeoutId);
    this.coverTimeoutId = setTimeout(this.onScreenCovered.bind(this), this.configData.coverDelay);
  }

  private playTransitionAnim(): void {
    this.transitionAnim.renderable = true;
    this.transitionAnim.playAnimation({ state: 'all', loop: false, defaultMix: 0 });
  }

  private onScreenCovered(): void {
    EventHandler.dispatchEvent(
      appModel.getIsFreeSpinsSession() ? SlotEvents.SHOW_FREEGAME_BG : SlotEvents.SHOW_MAINGAME_BG,
    );
  }

  private onTransitionComplete(): void {
    if (!this.visible) return;
    this.visible = false;
    clearTimeout(this.coverTimeoutId);
    this.hideTransitionAnim();
    StateManager.doNextStep();
  }
}
