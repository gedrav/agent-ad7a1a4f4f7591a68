import { TOTAL_WIN_COUNT_DURATION } from '@slots/jokercharge/config/MultiplierBadgeConfig';
import { CollectTarget, HoldNWinReelsContainer } from '../slot/HoldNWinReelsContainer';

// Paying the feature out: every held cell's figure is carried up to the logo by a trail and counted
// into the total win panel as it lands.
//
// The trails fly together, staggered, but the count-ups never overlap. Two on the panel at once and the second kills the first, which never fires its
// onComplete - see LogoComp.addTotalWin - so a trail that lands mid-count waits its turn.

// What the collect needs from the screen it runs on - see GameSlotMachineView.
export interface TotalWinCollectHost {
  // value, in bet multiples, is the figure the trail carries. onArrive fires as the trail's head
  // lands, onNextMayStart when the next cell's trail should set off.
  sendTrailToLogo(column: number, row: number, value: number, onArrive: () => void, onNextMayStart: () => void): void;
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

  const landed: number[] = [];
  let counting = false;
  let paid = 0;
  const countNext = (): void => {
    if (counting || !landed.length) return;
    counting = true;
    host.addTotalWin(landed.shift(), TOTAL_WIN_COUNT_DURATION, () => {
      counting = false;
      paid++;
      if (paid === targets.length) {
        onComplete?.();
        return;
      }
      countNext();
    });
  };

  const sendNext = (index: number): void => {
    const target = targets[index];
    if (!target) return;
    host.sendTrailToLogo(
      target.column,
      target.row,
      target.value,
      () => {
        landed.push(target.value);
        countNext();
      },
      () => sendNext(index + 1),
    );
  };
  sendNext(0);
}
