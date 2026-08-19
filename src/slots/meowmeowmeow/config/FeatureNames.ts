export const FEATURE_NAMES = {
  RED: 'RED',
  GREEN: 'GREEN',
  BLUE: 'BLUE',
} as const;

export type FeatureName = (typeof FEATURE_NAMES)[keyof typeof FEATURE_NAMES];
