import { MessagePopupView } from '@brand/views/popups/MessagePopupView';
import { CoreUIConfig } from './CoreUIConfig';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';

export const MESSAGE_POPUP_CONFIG = {
  name: 'messagePopupView',
  type: 'Comp',
  class: MessagePopupView,
  Elements: [
    {
      name: 'panelBG',
      type: 'NineSliceSprite',
      image: 'popupbg',
      nineSlice: [32, 32, 32, 32],
      lWidth: 712,
      lHeight: 752,
      pWidth: 712,
      pHeight: 752,
      width: 712,
      height: 752,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 356,
      y: 70,
      content: '',
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0xffffff },
    },
    {
      name: 'messageText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 356,
      y: 350,
      content: '',
      style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, align: 'center' },
    },
    {
      name: 'closeBtn',
      type: 'Button',
      scale: 1,
      data: false,
      options: {
        defaultView: 'cancelBtn',
        hoverView: 'cancelBtn',
        pressedView: 'cancelBtn',
        disabledView: 'cancelBtn',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'btnText',
        type: 'Text',
        content: 'closeText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 28, fontWeight: 700 },
      },
      x: 356,
      y: 670,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.3, heightPerc: 0.6, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.8, heightPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.94, heightPerc: 0.8, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
