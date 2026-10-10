import { MessagePopupView } from '@brand/views/popups/MessagePopupView';
import { CoreUIConfig } from './CoreUIConfig';
import { CloseBetPanelCommand } from '@core/commands/action/CloseBetPanelCommand';
import { JPHitCelebrationComp } from '@brand/views/comps/JPHitCelebrationComp';

export const JP_HIT_NOTIFICATION_CONFIG = {
  name: 'jpHitCelebrationComp',
  type: 'Comp',
  class: JPHitCelebrationComp,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      width: 200,
      height: 60,
      lHeight: 40,
      pHeight: 40,
      color: 0x000000,
      alpha: 0.8,
      layoutData: {
        Desktop: { hAlign: 'left', vAlign: 'top', widthPercForce: 1 },
        Landscape: { hAlign: 'left', vAlign: 'top', widthPercForce: 1, height: 40 },
        Portrait: { hAlign: 'left', vAlign: 'top', widthPercForce: 1, height: 40 },
      },
    },
    {
      name: 'msgText',
      type: 'Text',
      content: 'JPHitNotificationText',
      style: {
        fontFamily: 'commonFont',
        fontSize: 24,
        fill: 0xffffff,
        tagStyles: {
          jpUserColor: { fontSize: 24, fontWeight: 900 },
          jpNameColor: { fontSize: 30, fill: 0xffcc00 },
          jpValueColor: { fontSize: 30, fill: 0xffcc00 },
          gameNameColor: { fontSize: 24, fontWeight: 900 },
        },
      },
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle', widthPerc: 0.9, heightPerc: 0.7 },
        Landscape: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle', widthPerc: 0.9, heightPerc: 0.7 },
        Portrait: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle', widthPerc: 0.9, heightPerc: 0.7 },
      },
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.1 },
    Landscape: { hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.1 },
    Portrait: { hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.1 },
  },
};
