import { RefreshGameCommand } from '@core/commands/action/RefreshGameCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { UIConfig } from '@game/config/UIConfig';

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
          backgroundColor: 0x000000,
          borderColor: 0x7b8285,
          borderWidth: 10,
          radius: 24,
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
          name: 'refreshBtn',
          type: 'Button',
          x: 500,
          y: 700,
          action: {
            press: RefreshGameCommand,
          },
          textConfig: {
            contentText: 'Refresh',
            style: { fontFamily: 'commonFont', fontSize: 36, fill: 0xffffff },
            anchor: { x: 0.5, y: 0.5 },
          },
          options: {
            defaultView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0x333333 }),
            hoverView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0x555555 }),
            pressedView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0x333333 }),
            disabledView: UIUtil.getRoundedRectangle({ width: 300, height: 90, radius: 10, color: 0xcccccc }),
            animations: UIConfig.buttonStates,
          },
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
