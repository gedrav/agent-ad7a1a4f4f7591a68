import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';

const TINT_REST = 0xe0e0e0;
const TINT_HOVER = 0xffffff;
const TINT_PRESS = 0x999999;
const PRESS_SCALE = 0.92;
const TWEEN_DURATION = 0.12;

// Hover/press/click feedback for a plain Sprite used as a button.
//
// Uses PixiJS's unified pointer events directly rather than UIUtil's addHoverInteraction/
// addDownInteraction/etc. - those bind 'touchstart' for both hover and press (and 'touchend' for
// both up and click), so on any touch-capable input both fire together off one tap and their
// tweens fight over the same tint/scale. Pointer events fire once regardless of input type.
export function setupButtonInteraction(btn: PixSprite, onClick: () => void): void {
  btn.tint = TINT_REST;
  btn.eventMode = 'static';
  btn.cursor = 'pointer';
  const release = () => {
    AnimationProxy.animateTween(btn, { duration: TWEEN_DURATION, tint: TINT_HOVER, scaleX: 1, scaleY: 1 });
  };
  btn.on('pointerover', () => {
    AnimationProxy.animateTween(btn, { duration: TWEEN_DURATION, tint: TINT_HOVER });
  });
  btn.on('pointerout', () => {
    AnimationProxy.animateTween(btn, { duration: TWEEN_DURATION, tint: TINT_REST, scaleX: 1, scaleY: 1 });
  });
  btn.on('pointerdown', () => {
    AnimationProxy.animateTween(btn, {
      duration: TWEEN_DURATION * 0.7,
      tint: TINT_PRESS,
      scaleX: PRESS_SCALE,
      scaleY: PRESS_SCALE,
    });
  });
  btn.on('pointerup', release);
  btn.on('pointerupoutside', release);
  btn.on('pointertap', onClick);
}
