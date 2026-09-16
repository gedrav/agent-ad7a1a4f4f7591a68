// JokerCharge custom events, mirroring corelib's SlotEvents/AppEvents pattern.
export const JCEvents = {
  // See TransitionComp.playTransition().
  PLAY_TRANSITION: 'PLAY_TRANSITION',
  // Dispatch with the number of respins remaining as data, e.g. EventHandler.dispatchEvent(
  // JCEvents.UPDATE_RESPIN_COUNTER, 2). See RespinCounterComp.setRemainingRespins().
  UPDATE_RESPIN_COUNTER: 'UPDATE_RESPIN_COUNTER',
  // Dispatched with the newly selected line count (1-3) as data. See BuyBonusLinesComp.
  SELECTED_LINES: 'SELECTED_LINES',
  // Dispatched with the backend's final grid (string[][], column-major) once the spin response
  // lands. See JCSpinResponseReceivedState and HoldNWinReelsContainer.
  SPIN_RESULT_RECEIVED: 'SPIN_RESULT_RECEIVED',
  // Switches the screen between base-game and respin (bonus) layout. Dispatch with
  // { active, onConfirm? } - see GameSlotMachineView.setBonusTriggerLayout() and EnterRespinState.
  SET_BONUS_TRIGGER_LAYOUT: 'SET_BONUS_TRIGGER_LAYOUT',
} as const;

export type JCEvent = keyof typeof JCEvents;
export type JCEventValue = (typeof JCEvents)[JCEvent];
