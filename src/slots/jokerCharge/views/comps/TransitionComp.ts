import { Container } from 'pixi.js';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { setupButtonInteraction } from '@slots/jokerCharge/views/comps/buttonInteraction';

export interface TransitionData {
  // When given, the transition holds on its last frame with an OK button until the player
  // confirms, then fires this. Without it the transition is a plain one-shot wipe.
  onConfirm?: () => void;
}

export class TransitionComp extends ResponsiveView {
  private readonly transitionAnim: PixSpine;
  private readonly okBtnGroup: Container;
  private onConfirm: (() => void) | null = null;

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
    this.transitionAnim.playAnimation({ state: 'animation', loop: false });
    this.transitionAnim.setAnimationSpeed(0.75);

    if (!this.onConfirm) return;
    // The button only appears once the transition has finished playing, so it can't be clicked
    // through the animation.
    const listener = this.transitionAnim.addEventListener('complete', () => {
      if (listener) this.transitionAnim.removeSpineEvent(listener);
      this.okBtnGroup.visible = true;
    });
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
