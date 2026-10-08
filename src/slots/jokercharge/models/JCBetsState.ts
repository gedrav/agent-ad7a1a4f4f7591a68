import { appModel } from '@core/models/services/AppModelService';

// The backend's possibleBets covers every line count at once. Only the bets that split evenly
// across the lines in play are offered, and the line count sets the bet: 3 lines plays 3.00, from
// a list of 0.30, 0.60, 3.00 and the like. It narrows corelib's own bet list, so every bet getter,
// the +/- buttons, the bet panel, Buy Bonus pricing and the spin request follow it unchanged.

// The backend's full list, kept from the first narrowing on so a wider line count can widen it again.
let allBets: number[] | null = null;

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
// bet in play instead, as long as it still splits - for a session coming back with a bet of its
// own. Returns whether the bet in play changed.
export function applyLineBets(lines: number, keepBet = false): boolean {
  const info = appModel.gameInfo;
  allBets ??= [...info.betsArray];
  const current: number = info.betsArray[info.betPos];
  const bets = allBets.filter((bet) => splitsAcross(bet, lines));
  // Backend data: a list with nothing that splits would leave nothing to play, so it stays whole.
  if (!bets.length) return false;
  info.betsArray = bets;
  const kept = keepBet ? bets.indexOf(current) : -1;
  info.betPos = kept >= 0 ? kept : closestIndex(bets, lines);
  return bets[info.betPos] !== current;
}
