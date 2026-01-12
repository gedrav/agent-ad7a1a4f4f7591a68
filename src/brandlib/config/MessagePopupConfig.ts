import { MessagePopupView } from '@brand/views/popups/MessagePopupView';
import { CoreUIConfig } from './CoreUIConfig';
import { ErrorMessageCloseCommand } from '@core/commands/action/ErrorMessageCloseCommand';

export const MESSAGE_POPUP_CONFIG = {
  name: 'messagePopupView',
  type: 'Comp',
  class: MessagePopupView,
  Elements: [
    {
      name: 'panelBG',
      type: 'Sprite',
      image: 'shortPanelBG',
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 610,
      y: 130,
      content: '',
      style: { fontFamily: 'gameFont1', fontSize: 70, fill: 0xf5c95b },
    },
    {
      name: 'messageText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 610,
      y: 340,
      content: '',
      style: { fontFamily: 'gameFont1', fontSize: 55, fill: 0xf5c95b, align: 'center' },
    },

    {
      name: 'closeBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: ErrorMessageCloseCommand,
      },
      options: {
        defaultView: 'cancelBtn_up',
        hoverView: 'cancelBtn_up',
        pressedView: 'cancelBtn_up',
        disabledView: 'cancelBtn_up',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtnTxt',
        type: 'Text',
        content: 'closeBtnText',
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 40 },
        toUpperCase: true,
      },
      x: 610,
      y: 650,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
