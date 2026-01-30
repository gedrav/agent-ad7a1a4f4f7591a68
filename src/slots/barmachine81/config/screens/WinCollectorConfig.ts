import { WinCollectorComp } from '@game/views/comps/WinCollectorComp';
import { UIConfig } from '../UIConfig';

export const WIN_COLLECTOR_CONFIG: any = {
  name: 'winCollector',
  type: 'Comp',
  class: WinCollectorComp,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 386, height: 447, color: 0xffff00, alpha: 0 },
    { name: 'winCollectorBg', type: 'Sprite', image: 'dayWinCollectorBoxBG', x: 7, y: 40 },
    { name: 'maskRect', type: 'Graphics', color: 0x000000, width: 364, height: 359, x: 10, y: 43, alpha: 0 },
    {
      name: 'winBoxContainer',
      type: 'Container',
      x: 14,
      y: 45,
      Elements: [{ name: 'guideRect', type: 'Graphics', width: 360, height: 360, color: 0xffff00, alpha: 0 }],
    },
    { name: 'winCollectorFrame', type: 'Sprite', image: 'dayWinCollectorBoxFrame', x: 0, y: 0 },
    {
      name: 'upBtn',
      type: 'Button',
      anchor: { x: 0.5, y: 0.5 },
      options: {
        defaultView: 'arrow_down',
        hoverView: 'arrow_down',
        pressedView: 'arrow_down',
        disabledView: 'arrow_down',
        animations: UIConfig.buttonStates,
      },
      scale: { x: 1, y: -1 },
      x: 192,
      y: 23,
    },
    {
      name: 'downBtn',
      type: 'Button',
      anchor: { x: 0.5, y: 0.5 },
      options: {
        defaultView: 'arrow_down',
        hoverView: 'arrow_down',
        pressedView: 'arrow_down',
        disabledView: 'arrow_down',
        animations: UIConfig.buttonStates,
      },
      x: 192,
      y: 424,
    },
  ],
  data: {
    H1: { name: 'H1', type: 'Sprite', image: 'H1' },
    H2: { name: 'H2', type: 'Sprite', image: 'H2' },
    H3: { name: 'H3', type: 'Sprite', image: 'H3' },
    H4: { name: 'H4', type: 'Sprite', image: 'H4' },
    L1: { name: 'L1', type: 'Sprite', image: 'L1' },
    L2: { name: 'L2', type: 'Sprite', image: 'L2' },
    L3: { name: 'L3', type: 'Sprite', image: 'L3' },
    L4: { name: 'L4', type: 'Sprite', image: 'L4' },
    L5: { name: 'L5', type: 'Sprite', image: 'L5' },
  },
  layoutData: {
    Desktop: {
      refComponent: 'guideRect',
      widthPerc: 0.34,
      heightPerc: 0.34,
      hAlign: 'left',
      vAlign: 'middle',
      hPaddingPerc: -0.265,
    },
  },
};
