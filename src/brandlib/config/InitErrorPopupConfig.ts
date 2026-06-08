import { RefreshGameCommand } from '@core/commands/action/RefreshGameCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { CoreUIConfig } from './CoreUIConfig';

export const INIT_ERROR_POPUP_CONFIG = {
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
          backgroundColor: 0x272728,
          borderColor: 0x5841f1,
          borderWidth: 10,
          radius: 24,
        },
        {
          name: 'errorText',
          type: 'Text',
          style: {
            fontFamily: 'commonFont',
            fontSize: 30,
            fill: 0xd9d9d9,
            wordWrap: true,
            wordWrapWidth: 800,
            lineHeight: 40,
          },
          anchor: { x: 0.5, y: 0.5 },
          x: 500,
          y: 400,
        },
        /*{
          name: 'refreshBtn',
          type: 'Button',
          x: 500,
          y: 680,
          action: {
            press: RefreshGameCommand,
          },
          textConfig: {
            content: 'closeText',
            style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffffff, fontWeight: 'bold' },
            anchor: { x: 0.5, y: 0.5 },
          },
          options: {
            defaultView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0x0f0f0f }),
            hoverView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0x252525 }),
            pressedView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0x0f0f0f }),
            disabledView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0xcccccc }),
            animations: CoreUIConfig.buttonStates,
          },
        },*/
        {
          name: 'codeText',
          type: 'Text',
          style: {
            fontFamily: 'commonFont',
            fontSize: 24,
            fill: 0xd9d9d9,
          },
          anchor: { x: 0.5, y: 0.5 },
          x: 500,
          y: 770,
        },
      ],
      layoutData: {
        Desktop: { widthPerc: 0.4, heightPerc: 0.4, hAlign: 'center', vAlign: 'middle' },
        Portrait: { widthPerc: 0.8, heightPerc: 0.5, hAlign: 'center', vAlign: 'middle' },
        Landscape: { widthPerc: 0.5, heightPerc: 0.8, hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
