import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { StandardView } from '@core/pixiwrapper/StandardView';
import { UIUtil } from '@core/utils/UIUtilService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { SlotEvents } from '@core/events/SlotEvents';
import { StateManager } from '@core/states/StateManagerService';

export class TransitionAnimComp extends StandardView {
  private transitionAnim: PixSpine;

  constructor(config: any) {
    super(config);
    this.visible = false;
    EventHandler.addEventListener(SlotEvents.SHOW_TRANSITION_ANIM, this.onShowTransition.bind(this));
  }

  async onSecondaryAssetsLoaded() {
    super.onSecondaryAssetsLoaded();

    this.transitionAnim = UIUtil.getElement({
      name: 'transitionSpine',
      type: 'Spine',
      spineName: 'Transition',
      defaultState: 'horisontal',
    });

    this.addChild(this.transitionAnim);
    this.transitionAnim.visible = false;
    this.transitionAnim.addEventListener('complete', this.onTransitionComplete.bind(this));
    this.transitionAnim.x = this.guideRect.width / 2;
    this.transitionAnim.y = this.guideRect.height / 2;
  }

  private onShowTransition(): void {
    if (!this.transitionAnim) return;
    this.visible = true;
    this.transitionAnim.visible = true;
    this.transitionAnim.playAnimation({ state: 'horisontal', loop: false, defaultMix: 0 });
  }

  private onTransitionComplete(): void {
    this.transitionAnim.visible = false;
    this.visible = false;
    StateManager.doNextStep();
  }
}
