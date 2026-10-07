import { TOTAL_WIN_COUNT_DURATION } from '@slots/jokercharge/config/MultiplierBadgeConfig';
import { CollectTarget, HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';

// Paying the feature out: every held cell's figure is carried up to the logo by a trail and counted
// into the total win panel as it lands.
//
// Strictly one cell at a time. Overlapping them would put two count-ups on the panel at once, and
// the second kills the first, which never fires its onComplete - see LogoComp.addTotalWin.

// What the collect needs from the screen it runs on - see GameSlotMachineView.
export interface TotalWinCollectHost {
  // Calls back as the trail's head lands.
  sendTrailToLogo(column: number, row: number, onArrive: () => void): void;
  resetTotalWin(): void;
  addTotalWin(value: number, duration: number, onComplete: () => void): void;
}

export function playTotalWinCollect(
  container: HoldNWinReelsContainer,
  host: TotalWinCollectHost,
  onComplete?: () => void,
): void {
  const targets: CollectTarget[] = container.getCollectTargets();
  if (!targets.length) {
    onComplete?.();
    return;
  }

  host.resetTotalWin();

  const collectNext = (index: number): void => {
    if (index >= targets.length) {
      onComplete?.();
      return;
    }
    collectCell(host, targets[index], () => collectNext(index + 1));
  };
  collectNext(0);
}

function collectCell(host: TotalWinCollectHost, target: CollectTarget, onPaid: () => void): void {
  host.sendTrailToLogo(target.column, target.row, () =>
    host.addTotalWin(target.value, TOTAL_WIN_COUNT_DURATION, onPaid),
  );
}
