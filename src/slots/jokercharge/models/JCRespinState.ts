// How many respins the feature grants by default, and so how many lamps the counter draws. The
// backend sends the real figure as result.pendingFeature, which the triggering spin opens the
// session with - see getGrantedRespins in JCSpinData.
export const TOTAL_RESPINS = 3;

let total = TOTAL_RESPINS;
let remaining = TOTAL_RESPINS;
let firstRound = true;

// The counter is display only: the backend decides when the feature ends. It follows the
// backend's rule as the player sees it happen - a spin costs a respin the moment it starts, and
// a new symbol landing gives the full count back the moment it lands.
export function startRespinSession(granted: number): number {
  total = granted;
  remaining = granted;
  firstRound = true;
  return remaining;
}

// As a round's reels start.
export function spendRespin(): number {
  firstRound = false;
  remaining = Math.max(remaining - 1, 0);
  return remaining;
}

// As a new symbol lands during a round. A round landing several resets once per symbol, which
// changes nothing after the first.
export function resetRespins(): number {
  remaining = total;
  return remaining;
}

// True until the first round of the session has started.
export function isFirstRespinRound(): boolean {
  return firstRound;
}

export function getRemainingRespins(): number {
  return remaining;
}
