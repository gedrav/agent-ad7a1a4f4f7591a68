const stoneTextStyle = (dark: string): any => ({
  fontFamily: 'gameFont1',
  fontSize: 160,
  fill: ['#FFFFFF', '#FFF8D6', '#FFE07A'],
  fillGradientStops: [0, 0.5, 1],
  stroke: { color: dark, width: 14, join: 'round' },
  dropShadow: { color: dark, alpha: 1, blur: 0, angle: Math.PI / 2, distance: 9 },
  letterSpacing: 4,
  align: 'center',
  padding: 24,
});

export const STONE_TEXT_STYLES = {
  red: stoneTextStyle('#3D0008'),
  purple: stoneTextStyle('#2B0042'),
  orange: stoneTextStyle('#3A1200'),
  green: stoneTextStyle('#0E2800'),
};

export const MULTIPLIER_BADGE_CONFIG = {
  height: 52,
  padX: 22,
  minWidth: 92,
  shadow: { color: 0x1a0800, alpha: 0.55, offsetY: 5 },
  rim: { color: 0xffcf40, edge: 0x5a2e00, width: 4 },
  face: { color: 0xb3001b, gloss: 0.2 },
  text: { x: 0, y: -1 },
};

export const MULTIPLIER_BADGE_TEXT_STYLE: any = {
  fontFamily: 'gameFont1',
  fontSize: 52,
  fill: ['#FFFFFF', '#FFF0A0', '#FFC93C', '#F28C00'],
  fillGradientStops: [0, 0.3, 0.65, 1],
  stroke: { color: '#3A1500', width: 6, join: 'round' },
  dropShadow: { color: '#000000', alpha: 0.55, blur: 2, angle: Math.PI / 2, distance: 3 },
  letterSpacing: 2,
  padding: 12,
};
