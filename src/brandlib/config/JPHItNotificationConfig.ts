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
      color: 0x000000,
      alpha: 0.8,
      layoutData: {
        Desktop: { hAlign: 'left', vAlign: 'top', widthPercForce: 1 },
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
          jpValueColor: { fontSize: 30, fill: 0x00ff00 },
        },
      },
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { refComponent: 'guideRect', hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.1 },
  },
};
