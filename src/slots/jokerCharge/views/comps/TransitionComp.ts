import { Container } from 'pixi.js';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { setupButtonInteraction } from '@slots/jokerCharge/views/comps/buttonInteraction';

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
  private readonly transitionAnim: PixSpine;
  private readonly okBtnGroup: Container;
  private onConfirm: (() => void) | null = null;
  private halfwayTimeoutId: any = null;

  constructor(config: any) {
    super(config);
    this.transitionAnim = this.elementsList['transitionAnim'];
    this.okBtnGroup = this.elementsList['okBtnGroup'];
    const okBtn: PixSprite = (this.okBtnGroup as any).elementsList['okBtn'];
    setupButtonInteraction(okBtn, this.onOkClicked.bind(this));
    EventHandler.addEventListener(JCEvents.PLAY_TRANSITION, this.playTransition.bind(this));
  }

  public playTransition(data?: TransitionData): void {
    this.onConfirm = data?.onConfirm ?? null;
    this.okBtnGroup.visible = false;
    // Must come after playAnimation() - it resets state.timeScale to 1 every time it runs.
    this.transitionAnim.playAnimation({ state: TRANSITION_STATE, loop: false });
    this.transitionAnim.setAnimationSpeed(TRANSITION_SPEED);
    this.scheduleHalfway(data?.onHalfway);

    if (!this.onConfirm) return;
    // Only shown on complete, so it can't be clicked through the animation.
    const listener = this.transitionAnim.addEventListener('complete', () => {
      if (listener) this.transitionAnim.removeSpineEvent(listener);
      this.okBtnGroup.visible = true;
    });
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
