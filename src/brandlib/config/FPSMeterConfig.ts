export const FPSMETER_CONFIG = {
  name: 'fpsMeter',
  type: 'Comp',
  class: 'FPSMeterView',
  Elements: [
    { name: 'bg', type: 'Rectangle', width: 110, height: 32, radius: 12, color: 0x000000, alpha: 0.7 },
    {
      name: 'fpsText',
      type: 'Text',
      content: '',
      style: 'commonFont',
      anchor: { x: 0.5, y: 0.5 },
      fontSize: 20,
      fill: 0xffffff,
      layoutData: {
        Desktop: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'right', vAlign: 'top', hPadding: -8, vPadding: 8 },
  },
};
