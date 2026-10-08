import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';
import { DeviceProxy } from '@core/models/DeviceConfigProxy';
import { appModel } from '@core/models/services/AppModelService';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';

export class TransitionAnimComp extends ResponsiveChildrenView {
  private readonly transitionAnimHor: PixSpine;
  private readonly transitionAnimVer: PixSpine;
  private coverTimeoutId: any;

  constructor(config: any) {
    super(config);
    this.transitionAnimHor = this.elementsList['transitionAnimHor'];
    this.transitionAnimVer = this.elementsList['transitionAnimVer'];

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
    clearTimeout(this.coverTimeoutId);
    this.coverTimeoutId = setTimeout(this.onScreenCovered.bind(this), this.configData.coverDelay);
  }

  private playTransitionAnim(): void {
    this.transitionAnimHor.playAnimation({ state: 'animation', loop: false, defaultMix: 0 });
    this.transitionAnimVer.playAnimation({ state: 'animation', loop: false, defaultMix: 0 });
    this.resizeView();
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

  public resizeView(): void {
    super.resizeView();
    if (DeviceProxy.isDevice() && DeviceProxy.config.isPortrait) {
      this.transitionAnimVer.renderable = true;
      this.transitionAnimHor.renderable = false;
    } else {
      this.transitionAnimHor.renderable = true;
      this.transitionAnimVer.renderable = false;
    }
  }
}
