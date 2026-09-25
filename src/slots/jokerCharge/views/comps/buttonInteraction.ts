import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

const TINT_REST = 0xe0e0e0;
const TINT_HOVER = 0xffffff;
const TINT_PRESS = 0x999999;
const HOVER_SCALE = 1.06;
const PRESS_SCALE = 0.92;
const TWEEN_DURATION = 0.12;
const PRESS_DURATION = 0.08;

// Uses PixiJS's unified pointer events directly rather than UIUtil's addHoverInteraction/
// addDownInteraction/etc. - those bind 'touchstart' for both hover and press (and 'touchend' for
// both up and click), so on any touch-capable input both fire together off one tap and their
// tweens fight over the same tint/scale. Pointer events fire once regardless of input type.
// Only the scale is tweened. tint is a packed colour, so tweening it as a plain number counts
// through the integers between two colours rather than fading between them, and it would need
// GSAP's pixi plugin wrapper to do properly - so it's set outright instead.
export function setupButtonInteraction(btn: PixSprite, onClick: () => void): void {
  // Whatever the config gave it, so a scaled button isn't resized by hovering.
  const baseScale = btn.scale.x;

  const scaleTo = (factor: number, duration: number) => {
    AnimationProxy.animateTween(btn.scale, { duration, x: baseScale * factor, y: baseScale * factor });
  };

  btn.tint = TINT_REST;
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  btn.on('pointerover', () => {
    btn.tint = TINT_HOVER;
    scaleTo(HOVER_SCALE, TWEEN_DURATION);
  });
  btn.on('pointerout', () => {
    btn.tint = TINT_REST;
    scaleTo(1, TWEEN_DURATION);
  });
  btn.on('pointerdown', () => {
    btn.tint = TINT_PRESS;
    scaleTo(PRESS_SCALE, PRESS_DURATION);
  });
  const release = () => {
    btn.tint = TINT_HOVER;
    scaleTo(HOVER_SCALE, PRESS_DURATION);
  };
  btn.on('pointerup', release);
  btn.on('pointerupoutside', () => {
    btn.tint = TINT_REST;
    scaleTo(1, PRESS_DURATION);
  });
  btn.on('pointertap', onClick);
}
