import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import { JACKPOT_LABELS_CONFIG } from './JackpotLabelsConfig';
import { HOLD_N_WIN_REELS_CONFIG } from './HoldNWinReelsConfig';
import { LogoComp } from '@slots/jokerCharge/views/comps/LogoComp';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 1400,
      height: 954,
      alpha: 1,
    },
    {
      name: 'logoComp',
      type: 'Comp',
      class: LogoComp,
      Elements: [
        { name: 'guideRect', type: 'Graphics', width: 560, height: 200, color: 0xff0000, alpha: 0 },
        {
          name: 'logoAnim',
          type: 'Spine',
          spineName: 'logo',
          defaultState: 'idle',
          loop: true,
          scale: 1.3,
          x: 700,
          y: -115,
        },
      ],
      layoutData: {
        Desktop: {},
        Portrait: {},
        Landscape: {},
      },
    },
    {
      name: 'reelsBgDark',
      type: 'Sprite',
      image: 'reels_bg_dark',
      layoutData: {
        Desktop: { scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },
    {
      name: 'reelsFrame',
      type: 'Sprite',
      image: 'reels_frame',
      layoutData: {
        Desktop: { scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },
    {
      name: 'topPanelBg',
      type: 'Sprite',
      image: 'top_panel_bg',
      alpha: 0,
      layoutData: {
        Desktop: { scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },
    {
      name: 'topPanelFrame',
      type: 'Sprite',
      image: 'top_panel_frame',
      alpha: 0,
      layoutData: {
        Desktop: { scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },
    HOLD_N_WIN_REELS_CONFIG,
    JACKPOT_LABELS_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.5,
      heightPerc: 0.6,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0.07,
      hPaddingPerc: 0,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.6, vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
