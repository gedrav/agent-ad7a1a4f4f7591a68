import { RespinCounterComp } from '@slots/jokerCharge/views/comps/RespinCounterComp';

function compartment(index: 1 | 2 | 3, digitImage: string, x: number): any[] {
  return [
    { name: `light${index}`, type: 'Sprite', image: 'light_1', anchor: { x: 0.5, y: 0.5 }, x, y: 0 },
    { name: `dark${index}`, type: 'Sprite', image: 'dark_1', anchor: { x: 0.5, y: 0.5 }, x, y: 0 },
    { name: `digit${index}`, type: 'Sprite', image: digitImage, anchor: { x: 0.5, y: 0.5 }, x, y: 0 },
  ];
}

const COMPARTMENT_GAP = 610;

export const RESPIN_COUNTER_CONFIG: any = {
  name: 'respinCounterComp',
  type: 'Comp',
  class: RespinCounterComp,
  visible: false,
  x: 706,
  y: 1153,
  scale: 0.25,
  Elements: [
    { name: 'backPanel', type: 'Sprite', image: '123_back_panel', anchor: { x: 0.5, y: 0.5 } },
    ...compartment(1, '1', -COMPARTMENT_GAP),
    ...compartment(2, '2', 0),
    ...compartment(3, '3 copy', COMPARTMENT_GAP),
    { name: 'frame', type: 'Sprite', image: 'gold_frame_123', anchor: { x: 0.5, y: 0.5 } },
  ],
};
