export const MIN_LINES = 1;
export const MAX_LINES = 3;
// Row 1 (middle) is always active - MIN_LINES is 1, and line 1 alone activates it. Row 2 (bottom)
// needs line 2+, row 0 (top) needs all 3 lines. See BuyBonusLinesComp for the selector itself.
const MIDDLE_ROW = 1;
const BOTTOM_ROW = 2;
const TOP_ROW = 0;

// A fresh session starts on every line; a restored sticky session overrides this - see gameApp.
let selectedLines = MAX_LINES;
let respinActive = false;

// Called directly by BuyBonusLinesComp: this module can't self-subscribe to SELECTED_LINES,
// because a module-level addEventListener() runs before EventHandler.setScope() and no-ops.
export function setSelectedLines(lines: number): void {
  selectedLines = lines;
}

export function getSelectedLines(): number {
  return selectedLines;
}

export function setRespinActive(flag: boolean): void {
  respinActive = flag;
}

export function isRespinActive(): boolean {
  return respinActive;
}

// Whether a row shows the bright blank variant: per selected lines, or always during a respin.
export function isRowActive(row: number): boolean {
  if (respinActive) return true;
  if (row === MIDDLE_ROW) return true;
  if (row === BOTTOM_ROW) return selectedLines >= 2;
  if (row === TOP_ROW) return selectedLines >= MAX_LINES;
  return false;
}
