import { MessagePopupView } from '@brand/views/popups/MessagePopupView';
import { CoreUIConfig } from './CoreUIConfig';
import { ErrorMessageCloseCommand } from '@core/commands/action/ErrorMessageCloseCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { AutoPlayCancelBtnCommand } from '@core/commands/action/AutoPlayCancelBtnCommand';

export const MESSAGE_POPUP_CONFIG = {
  name: 'messagePopupView',
  type: 'Comp',
  class: MessagePopupView,
  Elements: [
    {
      name: 'panelBG',
      type: 'ResponsiveGraphics',
      image: 'shortPanelBG',
      width: 712,
      height: 752,
      radius: 48,
      color: 0xdae9f7,
    },
    {
      name: 'titleText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 356,
      y: 90,
      content: '',
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0x000000 },
    },
    {
      name: 'messageText',
      type: 'Text',
      anchor: { x: 0.5, y: 0.5 },
      x: 356,
      y: 350,
      content: '',
      style: { fontFamily: 'commonFont', fontSize: 32, fill: 0x000000, align: 'center' },
    },
    {
      name: 'closeBtn',
      type: 'Button',
      scale: 1,
      action: {
        press: AutoPlayCancelBtnCommand,
      },
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
    Desktop: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
