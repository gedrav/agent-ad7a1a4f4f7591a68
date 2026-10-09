import { Container } from 'pixi.js';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { UIUtil } from '@core/utils/UIUtilService';
import { JCEvents } from '@slots/jokercharge/events/JCEvents';
import { setupButtonInteraction } from '@slots/jokercharge/views/comps/buttonInteraction';

// The wipe is feature art in SECONDARY, so it is built when that arrives rather than from the
// config's Elements. Same spot as the OK button, under it.
const TRANSITION_SPINE_NAME = 'transition';
const TRANSITION_ANIM_POSITION = { x: 515, y: 555 };
const TRANSITION_STATE = 'animation';
const TRANSITION_SPEED = 0.5;
// transition.json's own length, used only if it can't be read off the skeleton.
const FALLBACK_DURATION = 1.1667;

export interface TransitionData {
  // Fires at the midpoint, where the wipe covers the screen - the moment to swap what's behind it.
  onHalfway?: () => void;
  // When given, the transition holds on its last frame with an OK button until the player confirms.
  onConfirm?: () => void;
}

export class TransitionComp extends ResponsiveView {
  private transitionAnim: PixSpine | null = null;
  private readonly okBtnGroup: Container;
  private onConfirm: (() => void) | null = null;
  private halfwayTimeoutId: any = null;
  // A wipe cut short by the next one never completes, so its listener is dropped by hand.
  private completeListener: any = null;

  constructor(config: any) {
    super(config);
    this.okBtnGroup = this.elementsList['okBtnGroup'];
    const okBtn: PixSprite = (this.okBtnGroup as any).elementsList['okBtn'];
    setupButtonInteraction(okBtn, this.onOkClicked.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_TRANSITION, this.playTransition.bind(this));
  }

  protected onSecondaryAssetsLoaded(): void {
    super.onSecondaryAssetsLoaded();
    if (this.transitionAnim) return;
    const anim = UIUtil.getSpineAnim(TRANSITION_SPINE_NAME, { spineName: TRANSITION_SPINE_NAME });
    anim.label = 'transitionAnim';
    anim.position.set(TRANSITION_ANIM_POSITION.x, TRANSITION_ANIM_POSITION.y);
    this.addChildAt(anim, this.getChildIndex(this.okBtnGroup));
    // Nothing to update until the first wipe - playTransition turns it on.
    anim.setAutoUpdate(false);
    this.transitionAnim = anim;
  }

  public playTransition(data?: TransitionData): void {
    // The feature waits for SECONDARY, so this only happens if that is ever bypassed: the moments
    // the wipe would have marked still happen, just without it.
    if (!this.transitionAnim) {
      data?.onHalfway?.();
      data?.onConfirm?.();
      return;
    }
    const transitionAnim = this.transitionAnim;
    this.releaseCompleteListener();
    this.onConfirm = data?.onConfirm ?? null;
    this.okBtnGroup.visible = false;
    transitionAnim.setAutoUpdate(true);
    // Must come after playAnimation() - it resets state.timeScale to 1 every time it runs.
    transitionAnim.playAnimation({ state: TRANSITION_STATE, loop: false });
    transitionAnim.setAnimationSpeed(TRANSITION_SPEED);
    this.scheduleHalfway(data?.onHalfway);

    const confirmable = !!this.onConfirm;
    this.completeListener = transitionAnim.addEventListener('complete', () => {
      this.releaseCompleteListener();
      // Held on its last frame, which the wipe ends clear on, so it needs no more updates.
      transitionAnim.setAutoUpdate(false);
      // Only shown on complete, so it can't be clicked through the animation.
      if (confirmable) this.okBtnGroup.visible = true;
    });
  }

  private releaseCompleteListener(): void {
    if (!this.completeListener) return;
    this.transitionAnim?.removeSpineEvent(this.completeListener);
    this.completeListener = null;
  }

  // Timed off the animation's length - transition.json has no events to hook a midpoint onto.
  private scheduleHalfway(onHalfway?: () => void): void {
    clearTimeout(this.halfwayTimeoutId);
    if (!onHalfway) return;
    this.halfwayTimeoutId = setTimeout(onHalfway, this.resolveDurationMs() / 2);
  }

  // PixSpine exposes no duration getter and corelib is off limits, so reach through to its Spine
  // object - `private` is compile-time only. Falls back if those internals ever move.
  private resolveDurationMs(): number {
    const spineAnim = (this.transitionAnim as any)?.spineAnim;
    const duration = spineAnim?.skeleton?.data?.findAnimation?.(TRANSITION_STATE)?.duration;
    return ((duration || FALLBACK_DURATION) / TRANSITION_SPEED) * 1000;
  }

  private onOkClicked(): void {
    if (!this.onConfirm) return;
    // Cleared before firing so a double tap can't advance the state machine twice.
    const confirm = this.onConfirm;
    this.onConfirm = null;
    this.okBtnGroup.visible = false;
    confirm();
  }
}
