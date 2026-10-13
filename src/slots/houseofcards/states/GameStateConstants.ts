export const GAMESTATES = {
  UPDATE_FRAME_BOARD_STATE: 'UPDATE_FRAME_BOARD_STATE',
} as const;

export type StateKey = keyof typeof GAMESTATES;
