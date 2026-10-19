import { PaylinesView } from '@brand/views/comps/PaylinesView';
import { PaylineComp } from '@brand/views/comps/PaylineComp';

export const PAYLINES_CONFIG: any = {
  name: 'paylinesView',
  type: 'Comp',
  class: PaylinesView,
  x: -81,
  y: 110,
  totalLines: 10,
  Elements: [
    { name: 'payline1', type: 'Comp', class: PaylineComp, x: 0, y: 394, image: 'Winline1' },
    { name: 'payline2', type: 'Comp', class: PaylineComp, x: 0, y: 720, image: 'Winline2' },
    { name: 'payline3', type: 'Comp', class: PaylineComp, x: 0, y: 140, image: 'Winline3' },
    { name: 'payline4', type: 'Comp', class: PaylineComp, x: 0, y: 68, image: 'Winline4' },
    { name: 'payline5', type: 'Comp', class: PaylineComp, x: 0, y: 0, image: 'Winline5' },
    { name: 'payline6', type: 'Comp', class: PaylineComp, x: 0, y: 212, image: 'Winline6' },
    { name: 'payline7', type: 'Comp', class: PaylineComp, x: 0, y: 213, image: 'Winline7' },
    { name: 'payline8', type: 'Comp', class: PaylineComp, x: 0, y: 470, image: 'Winline8' },
    { name: 'payline9', type: 'Comp', class: PaylineComp, x: 0, y: 70, image: 'Winline9' },
    { name: 'payline10', type: 'Comp', class: PaylineComp, x: 0, y: 60, image: 'Winline10' },
  ],
  layoutData: {
    Desktop: { scale: 1 },
    Landscape: { scale: 1, x: -81, y: 110 },
    Portrait: { scale: 0.9, x: 0, y: 160 },
    TPortrait: { scale: 1, x: -81, y: 160 },
  },
};
