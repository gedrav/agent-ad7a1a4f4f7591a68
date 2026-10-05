// The label on the panel's gold bar - see LogoComp, which hangs it off the rig.

// Attaching to the bar's slot means the label rides its slide and scale through the show
// animation, which keys this bone.
export const TOTAL_WIN_LABEL_SLOT = 'top_panel';

// The panel's last beat - see LogoComp.presentTotalWinPanel.
export const TOTAL_WIN_DIM_SIZE = 10000;
export const TOTAL_WIN_DIM_ALPHA = 0.8;
export const TOTAL_WIN_DIM_DURATION = 0.3;
export const TOTAL_WIN_PRESENT_DURATION = 0.5;
export const TOTAL_WIN_PRESENT_SCALE = 1.6;
export const TOTAL_WIN_PRESENT_EASE = 'back.out(1.2)';
// Held at the centre before it hides, so the figure can be read.
export const TOTAL_WIN_PRESENT_HOLD_MS = 700;

// Its bone is keyed in the show animation, so the figure arrives with the frame.
export const TOTAL_WIN_VALUE_SLOT = 'frame';

export const TOTAL_WIN_LABEL_CONFIG = {
  name: 'totalWinLabel',
  type: 'Text',
  contentText: 'TOTAL WIN',
  toUpperCase: true,
  anchor: { x: 0.5, y: 0.5 },
  style: {
    fontFamily: 'belweCondensed',
    fontWeight: 900,
    // The bar's attachment is 764x147 in the rig's own units, which the panel is placed at 1:1.
    fontSize: 78,
    letterSpacing: 4,
    // Burnt brown, cut out of the gold bar rather than lit on top of it.
    fill: [0x9a5205, 0x5a2600],
    fillGradientStops: [0, 1],
    align: 'center',
  },
};

export const TOTAL_WIN_VALUE_CONFIG = {
  name: 'totalWinValue',
  type: 'Text',
  contentText: '',
  anchor: { x: 0.5, y: 0.5 },
  style: {
    fontFamily: 'belweCondensed',
    fontWeight: 900,
    // The frame's attachment is 1019x325 in the rig's own units, which the panel is placed at 1:1.
    fontSize: 170,
    // Red into a deeper red, against a pale cream outline that lifts it off the gold behind.
    fill: [0xff6a4a, 0xe01a10, 0x8e0202],
    fillGradientStops: [0, 0.45, 1],
    stroke: { color: 0xfff4d6, width: 14, join: 'round' },
    dropShadow: { color: 0x3a0000, alpha: 0.6, blur: 4, distance: 6, angle: Math.PI / 2 },
    align: 'center',
  },
};
