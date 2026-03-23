import { Point } from 'pixi.js';

/**
 * Calculates a point on a cubic Bezier curve for a given t value.
 * @param {number} t - The parameter (0 <= t <= 1).
 * @param {object} start - Start point {x, y}.
 * @param {object} c1 - Control point 1 {x, y}.
 * @param {object} c2 - Control point 2 {x, y}.
 * @param {object} end - End point {x, y}.
 * @returns {object} The point on the curve {x, y}.
 */
export function getBezierPoint(t: number, start: Point, c1: Point, c2: Point, end: Point): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  // Bernstein polynomials
  const B0 = uuu;
  const B1 = 3 * uu * t;
  const B2 = 3 * u * tt;
  const B3 = ttt;

  return new Point(
    start.x * B0 + c1.x * B1 + c2.x * B2 + end.x * B3,
    start.y * B0 + c1.y * B1 + c2.y * B2 + end.y * B3,
  );
}

/**
 * Linearly interpolates between two numbers a and b by a ratio t.
 *
 * @param {number} start The start value.
 * @param {number} end The end value.
 * @param {number} t The interpolation factor (typically between 0.0 and 1.0).
 * @returns {number} The interpolated value.
 */
export function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}
