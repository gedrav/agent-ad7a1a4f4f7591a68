import { PaylinesView } from '@brand/views/comps/PaylinesView';
import { PaylineComp } from '@brand/views/comps/PaylineComp';

export const PAYLINES_CONFIG: any = {
  name: 'paylinesView',
  type: 'Comp',
  class: PaylinesView,
  x: 0,
  y: 0,
  totalLines: 10,
  Elements: [
    { name: 'payline1', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline1' },
    { name: 'payline2', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline2' },
    { name: 'payline3', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline3' },
    { name: 'payline4', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline4' },
    { name: 'payline5', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline5' },
    { name: 'payline6', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline6' },
    { name: 'payline7', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline7' },
    { name: 'payline8', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline8' },
    { name: 'payline9', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline9' },
    { name: 'payline10', type: 'Comp', class: PaylineComp, x: 0, y: 28, image: 'Winline10' },
  ],
};
