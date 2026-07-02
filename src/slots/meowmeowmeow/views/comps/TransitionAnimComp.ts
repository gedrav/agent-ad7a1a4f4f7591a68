import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class TransitionAnimComp extends ResponsiveChildrenView {
  private readonly transitionAnimHor: PixSpine;
  private readonly transitionAnimVer: PixSpine;

  constructor(config: any) {
    super(config);
    this.transitionAnimHor = this.elementsList['transitionAnimHor'];
    this.transitionAnimVer = this.elementsList['transitionAnimVer'];

    this.transitionAnimHor.x = this.guideRect.width / 2;
    this.transitionAnimHor.y = this.guideRect.height / 2;
    this.transitionAnimVer.x = this.guideRect.width / 2;
    this.transitionAnimVer.y = this.guideRect.height / 2;

    this.transitionAnimHor.addEventListener('complete', this.onTransitionComplete.bind(this));
    this.transitionAnimVer.addEventListener('complete', this.onTransitionComplete.bind(this));

    this.visible = false;
    this.hideTransitionAnim();

    EventHandler.addEventListener(SlotEvents.SHOW_TRANSITION_ANIM, this.onShowTransition.bind(this));
  }

  private hideTransitionAnim(): void {
    this.transitionAnimHor.renderable = false;
    this.transitionAnimVer.renderable = false;
  }

  private onShowTransition(): void {
    this.visible = true;
    this.playTransitionAnim();
  }

  private playTransitionAnim(): void {
    this.transitionAnimHor.playAnimation({ state: 'horisontal', loop: false, defaultMix: 0 });
    this.transitionAnimVer.playAnimation({ state: 'vertical', loop: false, defaultMix: 0 });

    this.resizeView();
  }

  private onTransitionComplete(): void {
    if (!this.visible) return;
    this.visible = false;
    this.hideTransitionAnim();
    StateManager.doNextStep();
  }

  public resizeView(): void {
    super.resizeView();
    if (DeviceProxy.config.isPortrait) {
      this.transitionAnimVer.renderable = true;
      this.transitionAnimHor.renderable = false;
    } else {
      this.transitionAnimHor.renderable = true;
      this.transitionAnimVer.renderable = false;
    }
  }
}
