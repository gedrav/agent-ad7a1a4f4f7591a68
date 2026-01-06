import { ModalView } from '@core/views/containers/ModalView';

export const MODAL_VIEW_CONFIG = {
  name: 'modalView',
  type: 'Comp',
  class: ModalView,
  Elements: [
    {
      name: 'modalRect',
      type: 'Graphics',
      width: 100,
      height: 100,
      color: 0x000000,
      alpha: 0.8,
      layoutData: {
        Desktop: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
        Landscape: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
        Portrait: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
      },
    },
  ],
};
