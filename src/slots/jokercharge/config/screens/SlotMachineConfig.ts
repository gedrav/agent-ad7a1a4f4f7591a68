import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import { JACKPOT_LABELS_CONFIG } from './JackpotLabelsConfig';
import { HOLD_N_WIN_REELS_CONFIG } from './HoldNWinReelsConfig';
import { BONUS_REELS_CONFIG } from './BonusReelsConfig';
import { RESPIN_COUNTER_CONFIG } from './RespinCounterConfig';
import { BUY_BONUS_LINES_CONFIG } from './BuyBonusLinesConfig';
import { FS_AUTO_COUNTER_CONFIG, TICKER_COMP_CONFIG } from './TickerCompConfig';
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
      // Hidden, not alpha 0, which still draws - the bonus layout shows it.
      visible: false,
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
      visible: false,
      layoutData: {
        Desktop: { y: -72, scale: 0.65 },
        Portrait: { y: -72, scale: 0.65 },
        Landscape: { y: -72, scale: 0.65 },
      },
    },
    TICKER_COMP_CONFIG,
    FS_AUTO_COUNTER_CONFIG,
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
        // Behind the panel only, and only for its last beat. Centred on the logo, sized to cover
        // the screen from wherever that is.
        {
          name: 'totalWinDim',
          type: 'Graphics',
          width: 10000,
          height: 10000,
          color: 0x000000,
          alpha: 0,
          x: 700 - 5000,
          y: -98 - 5000,
        },
        // Travels with the logo, the feature's layout shift included. No defaultState: it is held
        // back until the feature closes - see JCExitRespinState.
        {
          name: 'totalWinPanel',
          type: 'Spine',
          spineName: 'total_win_panel',
          visible: false,
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
    // The coin shower is feature art in SECONDARY, so GameSlotMachineView builds it when that
    // arrives.
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
    // Both landscape keys carry the same height budget. heightPerc is measured against the 954-unit
    // guide while the block that has to fit is about 1.6 times that, so fitting needs heightPerc
    // <= 0.62 - a ratio, and so the same on every screen. SmallLandscape only reaches phones that
    // pass UIUtil.isShortPhone(), which is iPhone SE sized and below; everything larger lands on
    // Landscape, where 0.94 ran the jackpot row and the logo off the top.
    Landscape: { widthPerc: 0.7, heightPerc: 0.62, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.06 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.62, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.06 },
  },
};
