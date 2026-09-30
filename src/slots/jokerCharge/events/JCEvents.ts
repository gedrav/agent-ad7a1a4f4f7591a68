export const JCEvents = {
  PLAY_TRANSITION: 'PLAY_TRANSITION',
  // Data: respins remaining.
  UPDATE_RESPIN_COUNTER: 'UPDATE_RESPIN_COUNTER',
  // Data: selected line count (1-3).
  SELECTED_LINES: 'SELECTED_LINES',
  // Data: the backend's final grid, column-major.
  SPIN_RESULT_RECEIVED: 'SPIN_RESULT_RECEIVED',
  // Data: the respin response's modifierRow, one symbol per top-reel column.
  TOP_REEL_RESULT_RECEIVED: 'TOP_REEL_RESULT_RECEIVED',
  // Data: { active }.
  SET_BONUS_TRIGGER_LAYOUT: 'SET_BONUS_TRIGGER_LAYOUT',
  // Data: { onConfirm? }.
  SHOW_RESPIN_INTRO: 'SHOW_RESPIN_INTRO',
  // Opens the Buy Bonus screen - see BuyBonusScreenComp.
  SHOW_BUY_BONUS_SCREEN: 'SHOW_BUY_BONUS_SCREEN',
  // The coin shower a metamorphic trigger plays before the wipe.
  PLAY_COINS_ANIMATION: 'PLAY_COINS_ANIMATION',
  // Data: { hold, onComplete } - see TriggerWinData.
  PLAY_TRIGGER_WIN_ANIMATION: 'PLAY_TRIGGER_WIN_ANIMATION',
  // Data: { hold, onComplete } - see ModifierEffectsData. Plays whatever the top panel is
  // showing: Multi, Super-Multi, Charged, Super-Charged.
  PLAY_MODIFIER_EFFECTS: 'PLAY_MODIFIER_EFFECTS',
  // Data: the MysteryReelResult the symbol landed on.
  MYSTERY_REEL_LANDED: 'MYSTERY_REEL_LANDED',
  // Data: { entries, hold, onComplete } - see MetamorphicRevealData.
  PLAY_METAMORPHIC_SYMBOLS: 'PLAY_METAMORPHIC_SYMBOLS',
  // Data: { column, row } - runs the trail from that cell up to the logo.
  PLAY_TRAIL_ANIMATION: 'PLAY_TRAIL_ANIMATION',
} as const;

export type JCEvent = keyof typeof JCEvents;
export type JCEventValue = (typeof JCEvents)[JCEvent];
