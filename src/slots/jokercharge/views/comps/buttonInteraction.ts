import { Container } from 'pixi.js';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

const TINT_REST = 0xe0e0e0;
const TINT_HOVER = 0xffffff;
const TINT_PRESS = 0x999999;
const HOVER_SCALE = 1.06;
const PRESS_SCALE = 0.92;
const TWEEN_DURATION = 0.12;
const PRESS_DURATION = 0.08;
const DISABLED_ALPHA = 0.5;
const restores = new WeakMap<Container, () => void>();

// Uses PixiJS's unified pointer events directly rather than UIUtil's addHoverInteraction/
// addDownInteraction/etc. - those bind 'touchstart' for both hover and press (and 'touchend' for
// both up and click), so on any touch-capable input both fire together off one tap and their
// tweens fight over the same tint/scale. Pointer events fire once regardless of input type.
// Only the scale is tweened. tint is a packed colour, so tweening it as a plain number counts
// through the integers between two colours rather than fading between them, and it would need
// GSAP's pixi plugin wrapper to do properly - so it's set outright instead.
// Takes a Container as readily as a Sprite: a button whose art and labels are separate objects
// has to be hooked as a group, or only the art reacts and anything drawn over it eats the click.
export function setupButtonInteraction(btn: Container, onClick: () => void): void {
  // Read when the pointer arrives rather than once up front: layoutData sets a button's scale on
  // the first resize, which lands after this runs, and that scale differs per orientation and can
  // be non-uniform where a sprite is reshaped with width/height. Capturing at construction would
  // snap the button to a stale size the first time it was hovered.
  let baseX = btn.scale.x;
  let baseY = btn.scale.y;
  let engaged = false;

  const engage = () => {
    if (engaged) return;
    baseX = btn.scale.x;
    baseY = btn.scale.y;
    engaged = true;
  };

  const scaleTo = (factor: number, duration: number) => {
    AnimationProxy.animateTween(btn.scale, { duration, x: baseX * factor, y: baseY * factor });
  };

  btn.tint = TINT_REST;
  btn.eventMode = 'static';
  btn.cursor = 'pointer';

  btn.on('pointerover', () => {
    engage();
    btn.tint = TINT_HOVER;
    scaleTo(HOVER_SCALE, TWEEN_DURATION);
  });
  const rest = () => {
    btn.tint = TINT_REST;
    if (engaged) scaleTo(1, TWEEN_DURATION);
    engaged = false;
  };
  restores.set(btn, rest);

  btn.on('pointerout', rest);
  btn.on('pointerdown', () => {
    engage();
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
    engaged = false;
  });
  btn.on('pointertap', onClick);
}

export function setButtonEnabled(btn: Container, enabled: boolean): void {
  if (!enabled) restores.get(btn)?.();
  btn.eventMode = enabled ? 'static' : 'none';
  btn.cursor = enabled ? 'pointer' : 'default';
  btn.alpha = enabled ? 1 : DISABLED_ALPHA;
}
