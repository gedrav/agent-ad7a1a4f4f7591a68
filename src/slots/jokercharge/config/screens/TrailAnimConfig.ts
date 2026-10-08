import { MULTIPLIER_TEXT_STYLE } from '../SymbolsConfig';

export const TRAIL_SPINE_NAME = 'line';
export const TRAIL_ANIMATION = 'trail';
export const TRAIL_ANIMATION_ALT = 'trail_2';

// The collect's figure rides the trail head on this slot, whose bone grows in and shrinks away with
// the head, so the text needs no timing of its own.
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

// Symbol across to a boost, keyed "fromColumn,fromRow>toColumn,toRow". TODO: fill in per pair - until
// a pair is here it borrows the symbol's own trail up to the logo, which only stands in for one.
const TO_BOOST_PLACEMENTS: Record<string, TrailPlacement> = {};

export function getBoostTrailPlacement(
  from: { column: number; row: number },
  to: { column: number; row: number },
): TrailPlacement | undefined {
  return (
    TO_BOOST_PLACEMENTS[`${from.column},${from.row}>${to.column},${to.row}`] ??
    getTrailPlacement(from.column, from.row, 'toLogo')
  );
}

export function getTrailPlacement(
  column: number,
  row: number,
  direction: TrailDirection = 'toLogo',
): TrailPlacement | undefined {
  return TRAIL_PLACEMENTS[direction][`${column},${row}`];
}
