import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import { JACKPOT_LABELS_CONFIG } from './JackpotLabelsConfig';
import { HOLD_N_WIN_REELS_CONFIG } from './HoldNWinReelsConfig';
import { BONUS_REELS_CONFIG } from './BonusReelsConfig';
import { RESPIN_COUNTER_CONFIG } from './RespinCounterConfig';
import { BUY_BONUS_LINES_CONFIG } from './BuyBonusLinesConfig';
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
      alpha: 0,
    },
    {
      name: 'reelbgAnim',
      type: 'Spine',
      spineName: 'big_square',
      defaultState: 'animation',
      loop: true,
      layoutData: {
        Desktop: { scale: 0.66, x: 706, y: 476 },
        Portrait: { scale: 0.66 },
        Landscape: { scale: 0.66 },
      },
    },

    {
      name: 'reelsBgDark',
      type: 'Sprite',
      image: 'reels_bg_light',
      layoutData: {
        Desktop: { scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },
    {
      name: 'lineAnim',
      type: 'Spine',
      spineName: 'line',
      defaultState: 'move_to_left3',
      loop: false,
      visible: false,
      x: 707,
      y: -140,
    },
    {
      name: 'reelsFrame',
      type: 'Sprite',
      // alpha: 0,
      image: 'center_line_frame',
      layoutData: {
        Desktop: { scale: 0.65, x: -11, y: 311 },
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
        Desktop: { y: -72, scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },

    // Between the panel's bg and frame, so the frame's gold border overlays the cell edges.
    BONUS_REELS_CONFIG,
    {
      name: 'topPanelFrame',
      type: 'Sprite',
      image: 'top_panel_frame',
      alpha: 0,
      layoutData: {
        Desktop: { y: -72, scale: 0.65 },
        Portrait: { scale: 0.65 },
        Landscape: { scale: 0.65 },
      },
    },
    HOLD_N_WIN_REELS_CONFIG,
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
          y: -98,
        },
      ],
      layoutData: {
        Desktop: {},
        Portrait: {},
        Landscape: {},
      },
    },
    // TEMPORARY: visible and looping from load so the placement can be set. The real entry is
    // driven by JCEvents.PLAY_COINS_ANIMATION - drop defaultState, set loop/visible back to false.
    {
      name: 'coinsAnim',
      type: 'Spine',
      spineName: 'coins',
      defaultState: 'all_animations',
      loop: false,
      visible: false,
      scale: 0.8,
      x: 666.5,
      y: -167,
    },
    JACKPOT_LABELS_CONFIG,
    RESPIN_COUNTER_CONFIG,
    BUY_BONUS_LINES_CONFIG,
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
