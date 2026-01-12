import { FSPopupComp } from '@brand/views/popups/FSPopupComp';
import { CoreUIConfig } from '@brand/config/CoreUIConfig';

export const FS_POPUP_CONFIG = {
  name: 'popupComp',
  type: 'Comp',
  class: FSPopupComp,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1296, height: 1028, color: 0xff0000, alpha: 0 },
    { name: 'popupbg', type: 'Sprite', image: 'popupBG' },
    {
      name: 'titleText',
      type: 'Text',
      contentText: '',
      style: { fontFamily: 'gameFont1', fontSize: 80, fill: 0xffff00, wordWrap: true, wordWrapWidth: 1100 },
      anchor: { x: 0.5, y: 0.5 },
      x: 648,
      y: 100,
    },
    {
      name: 'messageText1',
      type: 'Text',
      contentText: '',
      style: {
        fontFamily: 'gameFont1',
        fontSize: 60,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 1100,
        align: 'center',
      },
      anchor: { x: 0.5, y: 0.5 },
      x: 648,
      y: 345,
    },
    {
      name: 'messageText2',
      type: 'Text',
      contentText: '',
      style: {
        fontFamily: 'gameFont1',
        fontSize: 60,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 1100,
        align: 'center',
      },
      anchor: { x: 0.5, y: 0.5 },
      x: 648,
      y: 445,
    },
    {
      name: 'okBtn',
      type: 'Button',
      options: {
        defaultView: 'popupOkBtn',
        hoverView: 'popupOkBtn',
        pressedView: 'popupOkBtn',
        disabledView: 'popupOkBtn',
        animations: CoreUIConfig.buttonStates,
      },
      textConfig: {
        name: 'okBtnTxt',
        type: 'Text',
        content: 'okBtnText',
        style: { fontFamily: 'gameFont1', fill: 0xffffff, fontSize: 100 },
        toUpperCase: true,
      },
      x: 648,
      y: 720,
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'center', vAlign: 'middle', widthPerc: 0.8, heightPerc: 0.8, maxScale: 1 },
    Portrait: { hAlign: 'center', vAlign: 'middle', widthPerc: 0.8, heightPerc: 0.8 },
    Landscape: { hAlign: 'center', vAlign: 'middle', widthPerc: 0.8, heightPerc: 0.8, vPaddingPerc: 0.06 },
  },
};
