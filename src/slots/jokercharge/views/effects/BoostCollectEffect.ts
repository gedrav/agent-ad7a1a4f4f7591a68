import { BOOST_ADD_COUNT_DURATION, BOOST_COLLECT_STAGGER_MS } from '../../config/BoostConfig';
import { HoldNWinPosition, HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';
import { EffectStep } from './EffectSteps';

// Boost collection. A boost takes the value of every bonus and jackpot symbol on the grid - never
// another boost's, and never a mystery's that has not revealed yet.
//
// The symbols go one by one, each starting a beat after the last. A symbol carrying a multiplier
// spends it first, so the boost collects the multiplied figure, and keeps a faded copy of the badge
// that comes up to full once the boost has finished. Then a trail runs from the symbol to the
// boost, which plays its collect animation as it lands and climbs by that symbol's value.
//
// The boost's figure is worked out here from what is on the grid, not read from the backend.

// What the collection needs from the screen it runs on - see GameSlotMachineView.
export interface BoostCollectHost {
  // Calls back as the trail's head lands on the boost.
  sendTrailToBoost(from: HoldNWinPosition, to: HoldNWinPosition, onArrive: () => void): void;
}

// One step per boost, in the order given: each collects only once the one before has finished.
export function resolveBoostCollectSteps(
  container: HoldNWinReelsContainer,
  host: BoostCollectHost,
  boosts: HoldNWinPosition[],
): EffectStep[] {
  return boosts.map((boost) => (done) => collectIntoBoost(container, host, boost, done));
}

function collectIntoBoost(
  container: HoldNWinReelsContainer,
  host: BoostCollectHost,
  boost: HoldNWinPosition,
  onComplete: () => void,
): void {
  const boostReel = container.getReel(boost.column, boost.row);
  const sources = container.getBoostSources();
  if (!boostReel || !sources.length) {
    onComplete();
    return;
  }

  let remaining = sources.length;
  const collected = (): void => {
    if (--remaining > 0) return;
    container.settleBoostBadges(sources);
    onComplete();
  };

  sources.forEach((source, index) =>
    setTimeout(() => {
      const reel = container.getReel(source.column, source.row);
      reel.spendMultiplierForBoost(() =>
        host.sendTrailToBoost(source, boost, () => {
          boostReel.playBoostCollect();
          boostReel.addBoostValue(reel.getCollectValue(), BOOST_ADD_COUNT_DURATION, collected);
        }),
      );
    }, index * BOOST_COLLECT_STAGGER_MS),
  );
}
