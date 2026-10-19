import { appModel } from '@core/models/services/AppModelService';

export interface FrameBoardDiffEntry {
  position: number;
  from: number;
  to: number;
}

let prevBoard: number[] = [];

export function getFrameBoardDiff(board: number[]): FrameBoardDiffEntry[] {
  if (appModel.getCurrentFreeSpin() === 1) {
    prevBoard = new Array(board.length).fill(0);
  }

  const diff: FrameBoardDiffEntry[] = [];
  board.forEach((value, position) => {
    const from = prevBoard[position] ?? 0;
    if (value !== from) {
      diff.push({ position, from, to: value });
    }
  });
  prevBoard = [...board];

  return diff;
}
