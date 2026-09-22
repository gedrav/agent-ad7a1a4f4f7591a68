export const JCEvents = {
  PLAY_TRANSITION: 'PLAY_TRANSITION',
  // Data: respins remaining.
  UPDATE_RESPIN_COUNTER: 'UPDATE_RESPIN_COUNTER',
  // Data: selected line count (1-3).
  SELECTED_LINES: 'SELECTED_LINES',
  // Data: the backend's final grid, column-major.
  SPIN_RESULT_RECEIVED: 'SPIN_RESULT_RECEIVED',
  // Data: { active }.
  SET_BONUS_TRIGGER_LAYOUT: 'SET_BONUS_TRIGGER_LAYOUT',
  // Data: { onConfirm? }.
  SHOW_RESPIN_INTRO: 'SHOW_RESPIN_INTRO',
} as const;

export type JCEvent = keyof typeof JCEvents;
export type JCEventValue = (typeof JCEvents)[JCEvent];
