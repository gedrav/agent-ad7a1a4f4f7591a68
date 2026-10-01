// The per-cell multiplier badge and its arrival effect - see HoldNWinReel.showMultiplier().
export const MULTIPLIER_EFFECT_SPINE = 'multiplier_effect';
export const MULTIPLIER_EFFECT_STATE = 'animation';
export const MULTIPLIER_EFFECT_SCALE = 1;

export const MULTIPLIER_BADGE_STYLE = {
  fontFamily: 'belweCondensed',
  fontWeight: 900,
  fill: [0xffffff, 0xbfe2ff],
  stroke: { color: 0x17347d, width: 10 },
  fontSize: 80,
};

// Where the badge settles, measured in from the cell's top-right corner.
export const MULTIPLIER_BADGE_INSET = { x: 62, y: 52 };
// The badge growing in from nothing - any GSAP ease name works here.
export const MULTIPLIER_BADGE_ARRIVE_EASE = 'power2.out';
export const MULTIPLIER_BADGE_ARRIVE_DURATION = 0.3;
// The yoyo pulse it settles with: how far it swells, how long one swing takes, and how many
// swings follow the first. Keep the count odd so the pulse ends back at rest size.
export const MULTIPLIER_BADGE_PULSE_SCALE = 1.5;
export const MULTIPLIER_BADGE_PULSE_DURATION = 0.25;
export const MULTIPLIER_BADGE_PULSE_REPEAT = 3;
export const MULTIPLIER_BADGE_PULSE_EASE = 'sine.inOut';
// How big an already-placed badge swells when its value changes.
export const MULTIPLIER_BADGE_POP_SCALE = 2;
// The swell, and the move out to the corner it shrinks back over.
export const MULTIPLIER_BADGE_SCALE_DURATION = 0.35;
export const MULTIPLIER_BADGE_MOVE_DURATION = 0.5;
// The beat the badge holds at rest size, centred, before it sets off for the corner.
export const MULTIPLIER_BADGE_MOVE_DELAY = 0.3;
