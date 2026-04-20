import { UIUtil } from '@core/utils/UIUtilService';

export const ERROR_POPUP_CONFIG = {
  name: 'errorPopupView',
  type: 'Comp',
  class: 'ErrorPopupView',
  Elements: [
    {
      name: 'modalRect',
      type: 'Graphics',
      width: 1284,
      height: 2154,
      color: 0x000000,
      alpha: 0.3,
      layoutData: {
        Desktop: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
        Landscape: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
        Portrait: { heightPercForce: 1, widthPercForce: 1, hAlign: 'left', vAlign: 'top' },
      },
    },
    {
      name: 'popupCont',
      type: 'Container',
      Elements: [
        {
          name: 'bg',
          type: 'BorderRoundedRectangle',
          width: 1000,
          height: 800,
          backgroundColor: 0x000000,
          borderColor: 0x7b8285,
          borderWidth: 10,
          radius: 16,
          alpha: 0.7,
        },

        {
          name: 'errorText',
          type: 'Text',
          style: { fontFamily: 'commonFont', fontSize: 50, fill: 0xffffff },
          anchor: { x: 0.5, y: 0.5 },
          x: 500,
          y: 400,
        },
        {
          name: 'closeBtn',
          type: 'FancyButton',
          soundEvent: 'PLAY_GENERIC_BUTTON_SOUND',
          options: {
            defaultView: UIUtil.getRectangle(200, 60, 0xff0000),
            hoverView: `smallCross`,
            pressedView: `smallCross`,
            disabledView: `smallCross`,
            animations: {
              default: { props: { scale: { x: 1, y: 1 }, tint: 0xffffff }, duration: 100 },
              hover: { props: { scale: { x: 1.02, y: 1.02 } }, duration: 100 },
              pressed: { props: { scale: { x: 0.95, y: 0.95 }, tint: 0xcccccc }, duration: 100 },
            },
          },
          layoutData: {
            Desktop: { refComponent: 'topbar', widthPerc: 0.1, heightPerc: 0.5, vAlign: 'middle' },
            Portrait: {
              refComponent: 'topbar',
              heightPerc: 0.4,
              maxScale: 1,
              vAlign: 'middle',
              hAlign: 'right',
              hPaddingPerc: -0.04,
            },
          },
        },
      ],
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', widthPerc: 0.4, heightPerc: 0.4 },
        Portrait: { widthPerc: 0.8, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle' },
        Landscape: { widthPerc: 0.6, heightPerc: 0.8, hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
