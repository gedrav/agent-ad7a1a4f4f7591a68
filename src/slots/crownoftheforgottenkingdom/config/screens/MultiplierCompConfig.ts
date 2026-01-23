import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
import { MultiComp } from '@game/views/comps/MultiComp';

export const MULTIPLIER_CONFIG: any = {
  name: 'multiplierComp',
  type: 'Comp',
  class: MultiplierComp,
  x: 240,
  y: 0,
  Elements: [
    { name: 'bg', type: 'Sprite', image: 'topMultiPanel' },
    {
      name: 'mg_x1',
      type: 'Comp',
      class: MultiComp,
      x: 86,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'mg_x1', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'mg_x2',
      type: 'Comp',
      class: MultiComp,
      x: 354,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'mg_x2', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'mg_x3',
      type: 'Comp',
      class: MultiComp,
      x: 640,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'mg_x3', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'mg_x5',
      type: 'Comp',
      class: MultiComp,
      x: 930,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'mg_x5', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'fs_x2',
      type: 'Comp',
      class: MultiComp,
      x: 86,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'fs_x2', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'fs_x4',
      type: 'Comp',
      class: MultiComp,
      x: 354,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'fs_x4', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'fs_x6',
      type: 'Comp',
      class: MultiComp,
      x: 640,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'fs_x6', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
    {
      name: 'fs_x10',
      type: 'Comp',
      class: MultiComp,
      x: 930,
      y: 38,
      Elements: [{ name: 'multi', type: 'Sprite', image: 'fs_x10', anchor: { x: 0.5, y: 0.5 }, x: 140, y: 58 }],
    },
  ],
};
