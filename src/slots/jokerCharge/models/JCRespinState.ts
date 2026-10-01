// How many respins the feature grants by default, and so how many lamps the counter draws. The
// backend sends the real figure as result.pendingFeature, which the triggering spin opens the
// session with - see getGrantedRespins in JCSpinData.
export const TOTAL_RESPINS = 3;

let total = TOTAL_RESPINS;
let remaining = TOTAL_RESPINS;
let collectedCount = 0;
let firstRound = true;

// A respin round's response carries its own pendingFeature, but corelib keeps only
// featureResults[last] for a feature round, so from the game there is nothing to read it off.
// Rounds are judged here instead, by whether holdField grew, which is the backend's own rule.
export function startRespinSession(granted: number, collected: number): number {
  total = granted;
  remaining = granted;
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
    remaining = collected > collectedCount ? total : Math.max(remaining - 1, 0);
  }
  collectedCount = collected;
  return remaining;
}

// True until the first round of the session has been registered.
export function isFirstRespinRound(): boolean {
  return firstRound;
}

export function getRemainingRespins(): number {
  return remaining;
}
