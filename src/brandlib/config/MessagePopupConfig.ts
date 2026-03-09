import { MessagePopupView } from '@brand/views/popups/MessagePopupView';
import { CoreUIConfig } from './CoreUIConfig';
import { ErrorMessageCloseCommand } from '@core/commands/action/ErrorMessageCloseCommand';
import { LOAD_CONSTANTS } from '@core/models/LoadConstants';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { UIUtil } from '@core/utils/UIUtilService';

export const MESSAGE_POPUP_CONFIG = {
  name: 'messagePopupView',
  type: 'Comp',
  class: MessagePopupView,
  Elements: [
    {
      name: 'panelBG',
      type: 'ResponsiveGraphics',
      image: 'shortPanelBG',
      width: 1424,
      height: 1512,
      radius: 96,
      color: 0xdae9f7,
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
        press: CloseBetPanelCommand,
      },
      data: false,
      options: {
        defaultView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        hoverView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        pressedView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        disabledView: UIUtil.getRoundedRectangle({ width: 310, height: 130, radius: 16, color: 0x454c5d }),
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'closeBtn1Text',
        type: 'Text',
        content: 'closeText',
        style: { fontFamily: 'commonFont', fill: 0xffffff, fontSize: 44, fontWeight: 700 },
      },
      x: 712,
      y: 1320,
    },
  ],
  layoutData: {
    Desktop: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Landscape: { widthPerc: 0.5, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
    Portrait: { widthPerc: 0.9, maxScale: 1, hAlign: 'center', vAlign: 'middle' },
  },
};
