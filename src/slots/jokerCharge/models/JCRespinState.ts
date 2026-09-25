export const TOTAL_RESPINS = 3;

let remaining = TOTAL_RESPINS;
let collectedCount = 0;
let firstRound = true;

// The response has no remaining-respins field - currentCount tracks collected symbols, not the
// counter - so it's derived here from whether holdField grew.
export function startRespinSession(collected: number): number {
  remaining = TOTAL_RESPINS;
  collectedCount = collected;
  firstRound = true;
  return remaining;
}

// Called as a round starts, judging the round before it, so the counter moves with the spin rather
// than after it settles. Landing anything resets it; a round that collected nothing ticks it down.
// The first round has nothing preceding it, so it spins on the full count.
export function registerRespinRound(collected: number): number {
  if (firstRound) {
    firstRound = false;
  } else {
    remaining = collected > collectedCount ? TOTAL_RESPINS : Math.max(remaining - 1, 0);
  }
  collectedCount = collected;
  return remaining;
}

export function getRemainingRespins(): number {
  return remaining;
}
