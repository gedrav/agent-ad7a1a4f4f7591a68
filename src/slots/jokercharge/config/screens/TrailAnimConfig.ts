import { MULTIPLIER_TEXT_STYLE } from '../SymbolsConfig';

export const TRAIL_SPINE_NAME = 'line';
export const TRAIL_ANIMATION = 'trail';
export const TRAIL_ANIMATION_ALT = 'trail_2';

// The collect's figure rides the trail head on this slot. The animation never hides the slot, so the
// figure is taken off as the head lands - see GameSlotMachineView.playTrailOn.
export const TRAIL_VALUE_SLOT = 'TxtValue';
// Same look as the figure on the cash symbol it leaves. TODO: tune the scale against the real trail.
export const TRAIL_VALUE_TEXT_SCALE = 0.3;
export const TRAIL_VALUE_TEXT_CONFIG = {
  name: 'trailValueText',
  type: 'Text',
  contentText: '',
  style: MULTIPLIER_TEXT_STYLE,
};

// When the head of the trail has reached its target, which is what anything waiting on a trail
// actually waits for. Both animations run 1.2s, but the path travel is done by 0.37s and the last
// bone settles at 0.63s; the rest is the tail dissolving, and holding a symbol back for it leaves
// half a second of nothing after the trail has visibly landed.
export const TRAIL_ARRIVAL_MS = 500;

// When the head's path ends (0.3667s in both animations): the head is at its target from here and
// only shrinks away on the spot. The figure riding it goes now - it holds its size while the head
// shrinks, so left to the end of the shrink it would sit on the target after the head had gone.
export const TRAIL_HEAD_LANDED_MS = 367;

// The total-win collect's trails run 30% slower than the rest; arrival waits stretch to match.
export const TRAIL_COLLECT_SPEED = 0.7;

// The collect's trails all fly together, each setting off this long after the one before it.
export const TRAIL_COLLECT_STAGGER_MS = 300;

// Which way the trail reads. The spine only animates one way, start bone to finish bone, so the
// other direction is the same animation placed, turned and flipped to run the opposite way: hence
// a second set of numbers per cell rather than a second animation.
export type TrailDirection = 'toLogo' | 'fromLogo';

export interface TrailPlacement {
  x: number;
  y: number;
  // Degrees, clockwise.
  rotation: number;
  scaleX: number;
  scaleY: number;
  // Defaults to TRAIL_ANIMATION.
  animation?: string;
}

// Symbol up to the logo. Keyed "column,row", column-major and 0-indexed.
const TO_LOGO_PLACEMENTS: Record<string, TrailPlacement> = {
  '0,0': { x: 246, y: 168, rotation: 21, scaleX: -1, scaleY: 0.7 },
  '0,1': { x: 255, y: 425, rotation: 11, scaleX: -1, scaleY: 1 },
  '0,2': { x: 273, y: 733, rotation: 7.5, scaleX: -1, scaleY: 1.45 },
  '1,0': { x: 715, y: 200, rotation: 2, scaleX: 1, scaleY: 0.6, animation: TRAIL_ANIMATION_ALT },
  '1,1': { x: 712, y: 393, rotation: 36, scaleX: 1, scaleY: 0.7 },
  '1,2': { x: 712, y: 652, rotation: 23, scaleX: 1, scaleY: 1.2 },
  '2,0': { x: 672, y: 100, rotation: -30, scaleX: 0.95, scaleY: 0.7 },
  '2,1': { x: 1166, y: 468, rotation: -15, scaleX: 1, scaleY: 1.1 },
  '2,2': { x: 1090, y: 700, rotation: -6, scaleX: 1, scaleY: 1.4 },
};

// Logo down to the symbol. Every cell starts from roughly the same point behind the logo and
// fans out to its own, which is why these share an x/y where the toLogo ones do not.
const FROM_LOGO_PLACEMENTS: Record<string, TrailPlacement> = {
  '0,0': { x: 672, y: -96.5, rotation: -83, scaleX: 1, scaleY: 0.6 },
  '0,1': { x: 672, y: -96.5, rotation: -114, scaleX: 1, scaleY: 1 },
  '0,2': { x: 672, y: -96.5, rotation: -134, scaleX: 1, scaleY: 1.4 },
  '1,0': { x: 672, y: -146, rotation: -180, scaleX: 1, scaleY: 0.6, animation: TRAIL_ANIMATION_ALT },
  '1,1': { x: 672, y: -96.5, rotation: -149, scaleX: 1, scaleY: 0.7 },
  '1,2': { x: 672, y: -96.5, rotation: -160, scaleX: 1, scaleY: 1.3 },
  '2,0': { x: 713, y: -96.5, rotation: -278, scaleX: -1, scaleY: 0.7 },
  '2,1': { x: 713, y: -96.5, rotation: -243, scaleX: -1, scaleY: 1.1 },
  '2,2': { x: 713, y: -96.5, rotation: -227, scaleX: -1, scaleY: 1.4 },
};

export const TRAIL_PLACEMENTS: Record<TrailDirection, Record<string, TrailPlacement>> = {
  toLogo: TO_LOGO_PLACEMENTS,
  fromLogo: FROM_LOGO_PLACEMENTS,
};

// Hand-made overrides for a symbol's trail across to a boost, keyed "fromColumn,fromRow>toColumn,toRow".
// Any pair not here is fitted - see fitTrailPlacement.
const TO_BOOST_PLACEMENTS: Record<string, TrailPlacement> = {};

export function getBoostTrailPlacement(
  from: { column: number; row: number },
  to: { column: number; row: number },
): TrailPlacement | undefined {
  return TO_BOOST_PLACEMENTS[`${from.column},${from.row}>${to.column},${to.row}`];
}

// Where the 'trail' animation's head first shows and where it comes to rest (by 0.4s), in the
// spine's own space, y down. Measured from line.json with spine-core; remeasure if the art changes.
const TRAIL_HEAD_START = { x: -2.3, y: -57.5 };
const TRAIL_HEAD_END = { x: -302.1, y: -614.9 };

// Fits the 'trail' animation so its head starts on `from` and lands on `to`, both in the slot
// machine view's space. It is never drawn wider than it was made, only longer, so a long reach
// stays slim and a short one shrinks evenly rather than flattening. It is mirrored when heading
// right, which keeps the curve bowing the way the logo trails do.
export function fitTrailPlacement(from: { x: number; y: number }, to: { x: number; y: number }): TrailPlacement {
  const vx = TRAIL_HEAD_END.x - TRAIL_HEAD_START.x;
  const vy = TRAIL_HEAD_END.y - TRAIL_HEAD_START.y;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const width = Math.min(1, distance / Math.hypot(vx, vy));
  const length = Math.sqrt(Math.max(distance * distance - (width * vx) ** 2, 0)) / Math.abs(vy);
  const scaleX = dx > 0 ? -width : width;
  const scaleY = length;
  const rotation = Math.atan2(dy, dx) - Math.atan2(scaleY * vy, scaleX * vx);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const startX = scaleX * TRAIL_HEAD_START.x;
  const startY = scaleY * TRAIL_HEAD_START.y;
  return {
    x: from.x - (cos * startX - sin * startY),
    y: from.y - (sin * startX + cos * startY),
    rotation: (rotation * 180) / Math.PI,
    scaleX,
    scaleY,
    animation: TRAIL_ANIMATION,
  };
}

export function getTrailPlacement(
  column: number,
  row: number,
  direction: TrailDirection = 'toLogo',
): TrailPlacement | undefined {
  return TRAIL_PLACEMENTS[direction][`${column},${row}`];
}
