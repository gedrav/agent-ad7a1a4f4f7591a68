import { MineDashFeaturePopupComp } from '@game/views/popups/MineDashFeaturePopupComp';
import { WinTicker } from '@core/views/comps/WinTicker';

export const MINEDASH_FS_POPUP_CONFIG = {
  name: 'popupComp',
  type: 'Comp',
  class: MineDashFeaturePopupComp,
  Elements: [
    { name: 'guideRect', type: 'Graphics', width: 1800, height: 1500, color: 0xff0000, alpha: 0 },
    {
      name: 'popupbg',
      type: 'Spine',
      spineName: 'MD_FeaturePopUP',
      animName: 'FreeSpin_Ideal',
      defaultSkin: 'Smoll',
      loop: true,
      x: 900,
      y: 775,
    },
    {
      name: 'titleText',
      type: 'Text',
      contentText: '',
      style: { fontFamily: 'gameFont1', fontSize: 150, fill: 0xffff00, wordWrap: true, wordWrapWidth: 1000 },
      anchor: { x: 0.5, y: 0.5 },
      x: 900,
      y: 655,
    },
    {
      name: 'messageText1',
      type: 'BitmapText',
      contentText: '',
      style: {
        fontFamily: 'bitmapFont',
        fontSize: 340,
        fill: 0xffffff,
        align: 'center',
      },
      anchor: { x: 0.5, y: 0.5 },
      x: 900,
      y: 895,
    },

    {
      name: 'winTicker',
      type: 'Comp',
      class: WinTicker,
      x: 900,
      y: 895,
      Elements: [
        {
          name: 'valueText',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          style: { fontFamily: 'bitmapFont', fontSize: 340, fill: 0xffffff },
        },
      ],
    },
  ],
  layoutData: {
    Desktop: {
      hAlign: 'center',
      vAlign: 'middle',
      refComponent: 'slotMachineView',
      widthPerc: 0.9,
      heightPerc: 0.9,
      maxScale: 0.4,
    },
    Portrait: {
      hAlign: 'center',
      vAlign: 'middle',
      refComponent: 'slotMachineView',
      widthPerc: 0.95,
      heightPerc: 0.9,
      maxScale: 0.4,
    },
    Landscape: {
      hAlign: 'center',
      vAlign: 'middle',
      refComponent: 'slotMachineView',
      widthPerc: 0.9,
      heightPerc: 0.9,
      maxScale: 0.4,
    },
  },
};
