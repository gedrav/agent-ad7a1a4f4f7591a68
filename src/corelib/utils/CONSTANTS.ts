export const CONSTANTS = {
  BELOW_TOTALBET_WIN: 'BELOW_TOTALBET_WIN',
  STANDARD_WIN: 'STANDARD_WIN',
  BIG_WIN: 'BIG_WIN',
  SUPER_WIN: 'SUPER_WIN',
  MEGA_WIN: 'MEGA_WIN',
  EPIC_WIN: 'EPIC_WIN',
  FEATURE_TYPE_FREESPIN: 'freespins',
} as const;

export type ConstantKey = keyof typeof CONSTANTS;
