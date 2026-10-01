import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import { JACKPOT_LABELS_CONFIG } from './JackpotLabelsConfig';
import { HOLD_N_WIN_REELS_CONFIG } from './HoldNWinReelsConfig';
import { BONUS_REELS_CONFIG } from './BonusReelsConfig';
import { RESPIN_COUNTER_CONFIG } from './RespinCounterConfig';
import { BUY_BONUS_LINES_CONFIG } from './BuyBonusLinesConfig';
import { LogoComp } from '@slots/jokercharge/views/comps/LogoComp';

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
        Desktop: { scale: 0.66, x: 706, y: 458 },
        Portrait: { scale: 0.66, x: 706, y: 458 },
        Landscape: { scale: 0.66, x: 706, y: 458 },
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
      name: 'reelsFrame',
      type: 'Sprite',
      // alpha: 0,
      image: 'center_line_frame',
      layoutData: {
        Desktop: { scale: 0.65, x: -11, y: 311 },
        Portrait: { scale: 0.65, x: -11, y: 311 },
        Landscape: { scale: 0.65, x: -11, y: 311 },
      },
    },
    {
      name: 'topPanelBg',
      type: 'Sprite',
      image: 'top_panel_bg',
      alpha: 0,
      layoutData: {
        Desktop: { y: -72, scale: 0.65 },
        Portrait: { y: -72, scale: 0.65 },
        Landscape: { y: -72, scale: 0.65 },
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
        Portrait: { y: -72, scale: 0.65 },
        Landscape: { y: -72, scale: 0.65 },
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
    {
      name: 'lineAnim',
      type: 'Spine',
      spineName: 'line',
      // No defaultState on purpose: UIUtil.getSpineAnim plays it the moment the element is built,
      // and this one is fired per reveal by GameSlotMachineView.playTrail. The spine also holds a
      // single animation, 'trail' - the name that was here before does not exist in line.json, and
      // spine's setAnimation throws on an unknown name.
      // Starting point only: every play sets x, y, rotation and scale from TRAIL_PLACEMENTS.
      visible: false,
      x: 707,
      y: -140,
    },
    // No defaultState: the shower is fired by JCEvents.PLAY_COINS_ANIMATION, and getSpineAnim
    // would otherwise play it once at build time.
    {
      name: 'coinsAnim',
      type: 'Spine',
      spineName: 'coins',
      visible: false,
      scale: 0.8,
      x: 666.5,
      y: -167,
    },
    JACKPOT_LABELS_CONFIG,
    RESPIN_COUNTER_CONFIG,
    BUY_BONUS_LINES_CONFIG,
  ],
  // guideRect measures 1400x954, but the jackpot labels and the logo sit roughly 350 units above
  // its top and the buy/lines row sits below its bottom in portrait, so the block that has to fit
  // on screen is nearer 1300 units tall (1600 in portrait). heightPerc is set against 954, hence
  // the values well below 1. Portrait is width-bound, so there heightPerc only acts as a cap and
  // the negative vPadding lifts the block clear of the control panel. Landscape sets y outright
  // instead of aligning: positionElement applies x/y first and vAlign second, so a vAlign here
  // would overwrite the y.
  layoutData: {
    Desktop: {
      widthPerc: 0.5,
      heightPerc: 0.6,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0.07,
      hPaddingPerc: 0,
    },
    // widthPerc is the size knob here: it alone decides the scale, one point being one percent.
    Portrait: { widthPerc: 0.92, heightPerc: 0.72, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.05 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.62, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.06 },
  },
};
