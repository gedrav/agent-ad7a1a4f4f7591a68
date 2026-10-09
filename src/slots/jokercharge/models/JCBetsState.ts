import { appModel } from '@core/models/services/AppModelService';

// The backend's possibleBets covers every line count at once. Only the bets that split evenly
// across the lines in play are offered, and the line count sets the bet: 3 lines plays 3.00, from
// a list of 0.30, 0.60, 3.00 and the like. It narrows corelib's own bet list, so every bet getter,
// the +/- buttons, the bet panel and the spin request follow it unchanged.
//
// A bet can also be held outside that list for one round - a bought bonus, which is priced on the
// full list whatever the lines, or a resumed round played at a bet the lines don't allow. It stays
// in play until the round is over, then the line list comes back at the bet it had before.

// The backend's full list, kept from the first narrowing on so a wider line count can widen it again.
let allBets: number[] | null = null;
// The line list and its bet, put aside while a held bet plays.
let heldFrom: { bets: number[]; pos: number } | null = null;

export function getFullBets(): number[] {
  allBets ??= [...appModel.gameInfo.betsArray];
  return allBets;
}

// In cents: the bets are money, and 0.3 % 3 is not 0 in floating point.
function splitsAcross(bet: number, lines: number): boolean {
  return Math.round(bet * 100) % lines === 0;
}

function closestIndex(bets: number[], target: number): number {
  let best = 0;
  bets.forEach((bet, index) => {
    if (Math.abs(bet - target) < Math.abs(bets[best] - target)) best = index;
  });
  return best;
}

// The bet becomes the line count itself, or the nearest offered bet to it. keepBet holds on to the
// bet in play instead - for a session coming back with a bet of its own - held for the round if the
// lines don't allow it. Returns whether the bet in play changed.
export function applyLineBets(lines: number, keepBet = false): boolean {
  const info = appModel.gameInfo;
  const current: number = info.betsArray[info.betPos];
  const bets = getFullBets().filter((bet) => splitsAcross(bet, lines));
  // Backend data: a list with nothing that splits would leave nothing to play, so it stays whole.
  if (!bets.length) return false;
  heldFrom = null;
  if (keepBet) {
    const kept = bets.indexOf(current);
    if (kept < 0) {
      holdBet(current, { bets, pos: closestIndex(bets, lines) });
      return false;
    }
    info.betsArray = bets;
    info.betPos = kept;
    return false;
  }
  info.betsArray = bets;
  info.betPos = closestIndex(bets, lines);
  return bets[info.betPos] !== current;
}

// Puts bet in play from the full list until releaseHeldBet. restoreTo is what comes back after;
// by default, the list and bet in play now.
export function holdBet(bet: number, restoreTo?: { bets: number[]; pos: number }): void {
  const info = appModel.gameInfo;
  const full = getFullBets();
  heldFrom ??= restoreTo ?? { bets: info.betsArray, pos: info.betPos };
  info.betsArray = full;
  info.betPos = full.indexOf(bet);
}

// Returns whether a held bet was put away.
export function releaseHeldBet(): boolean {
  if (!heldFrom) return false;
  const info = appModel.gameInfo;
  info.betsArray = heldFrom.bets;
  info.betPos = heldFrom.pos;
  heldFrom = null;
  return true;
}
