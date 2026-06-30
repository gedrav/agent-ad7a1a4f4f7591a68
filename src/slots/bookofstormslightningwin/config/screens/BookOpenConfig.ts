import { BookOpenComp } from '@game/views/comps/BookOpenComp';

export const BOOK_OPEN_CONFIG = {
  name: 'bookOpenComp',
  type: 'Comp',
  class: BookOpenComp,
  Elements: [{ name: 'guideRect', type: 'Graphics', width: 1610, height: 1190, color: 0xffff00, x: 0, y: 0, alpha: 0 }],
  layoutData: {
    Desktop: { refComponent: 'guideRect', widthPerc: 1, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: {
      refComponent: 'guideRect',
      widthPerc: 1,
      heightPerc: 0.9,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
    },
    Portrait: {
      refComponent: 'guideRect',
      widthPerc: 0.9,
      heightPerc: 1,
      maxScale: 1,
      hAlign: 'center',
      vAlign: 'middle',
    },
  },
};
