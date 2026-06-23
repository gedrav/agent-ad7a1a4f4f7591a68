import { RefreshGameCommand } from '@core/commands/action/RefreshGameCommand';
import { UIUtil } from '@core/utils/UIUtilService';
import { CoreUIConfig } from './CoreUIConfig';
import { SecondaryWaitingView } from '@brand/views/containers/SecondaryWaitingView';

export const SECONDARY_WAITING_SCREEN_CONFIG = {
  name: 'secondaryWaitingScreenView',
  type: 'Comp',
  class: SecondaryWaitingView,
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
          height: 500,
          backgroundColor: 0x272728,
          borderColor: 0x5841f1,
          borderWidth: 10,
          radius: 24,
        },
        {
          name: 'loader',
          type: 'Sprite',
          image: 'loader_anim',
          x: 500,
          y: 160,
          anchor: { x: 0.5, y: 0.5 },
          scale: 0.5,
        },
        {
          name: 'msgText',
          type: 'Text',
          content: 'secondaryWaitingText',
          style: {
            fontFamily: 'commonFont',
            fontSize: 32,
            mFontSize: 50,
            fill: 0xd9d9d9,
            wordWrap: true,
            wordWrapWidth: 800,
            align: 'center',
          },
          anchor: { x: 0.5, y: 0.5 },
          x: 500,
          y: 350,
        },
      ],
      layoutData: {
        Desktop: { widthPerc: 0.4, heightPerc: 0.4, hAlign: 'center', vAlign: 'middle' },
        Portrait: { widthPerc: 0.9, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle' },
        Landscape: { widthPerc: 0.5, heightPerc: 0.5, hAlign: 'center', vAlign: 'middle' },
      },
    },
  ],
};
