import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import GameWinController from '@game/views/slot/GameWinController';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { GameLineWinAmountComp } from '@game/views/comps/GameLineWinAmountComp';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { TICKER_COMP_CONFIG } from '@game/config/screens/TickerCompConfig';
import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import { ReelStripBG } from '@game/views/comps/ReelStripBG';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { FSAUTO_COUNTER_CONFIG } from '@game/config/screens/FSAutoCounterConfig';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 1300,
      height1: 1050,
      height: 1050,
      alpha: 0,
    },

    {
      name: 'slotReel',
      type: 'Comp',
      class: SlotReelStandard,
      winController: GameWinController,
      x: -150,
      y: 10,
      data: {
        symbolClass: ReelSymbolSpine,
        noOfReels: 4,
        noOfRows: 3,
        reelHeight: 660,
        reelsConfig: ReelsConfig,
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 324, y: 295 },
            reelPositionX: [0, 320, 640, 950],
            symbolHeight: 226,
            symbolScale: 1,
          },
          Portrait: {
            reelContainerPos: { x: 324, y: 295 },
            reelPositionX: [0, 320, 640, 950],
            symbolHeight: 226,
            symbolScale: 1,
          },
          Landscape: {
            reelContainerPos: { x: 324, y: 295 },
            reelPositionX: [0, 320, 640, 950],
            symbolHeight: 226,
            symbolScale: 1,
          },
        },

        symbolsData: {
          WD: {
            name: 'WD',
            spineName: 'wild_Spine',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          H1: {
            name: 'H1',
            spineName: '777_Spine',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          H2: {
            name: 'H2',
            spineName: 'bar_spine',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          H3: {
            name: 'H3',
            spineName: 'bells_Spine',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          H4: {
            name: 'H4',
            spineName: 'watermelon_Spine',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          L1: {
            name: 'L1',
            spineName: 'plum_spine',
            skin: 'default',
            idleAnim1: 'Idle',
            winAnim1: 'Win',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          L2: {
            name: 'L2',
            spineName: 'lemon_Spine_pro',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          L3: {
            name: 'L3',
            spineName: 'orange_Spine',
            skin: 'default',
            idleAnim: 'Idle',
            winAnim: 'Win',
          },
          L4: {
            name: 'L4',
            spineName: 'cherry_spine_cuts',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'Win_anims',
          },
        },
      },
      Elements: [
        {
          name: 'reelstripBG',
          type: 'Comp',
          class: ReelStripBG,
          x: 168,
          y: 148,
          Elements: [
            { name: 'bgg1', tint: 0x000000, type: 'Sprite', image: 'reelstripbg', x: 0, y: 0 },
            { name: 'bgg2', tint: 0x000000, type: 'Sprite', image: 'reelstripbg', x: 320, y: 0 },
            { name: 'bgg3', tint: 0x000000, type: 'Sprite', image: 'reelstripbg', x: 640, y: 0 },
            { name: 'bgg4', tint: 0x000000, type: 'Sprite', image: 'reelstripbg', x: 960, y: 0 },
            { name: 'bg1', type: 'Sprite', image: 'reelstripbg', x: 0, y: 0 },
            { name: 'bg2', type: 'Sprite', image: 'reelstripbg', x: 320, y: 0 },
            { name: 'bg3', type: 'Sprite', image: 'reelstripbg', x: 640, y: 0 },
            { name: 'bg4', type: 'Sprite', image: 'reelstripbg', x: 960, y: 0 },
          ],
        },
        { name: 'reelReflection', type: 'Sprite', image: 'reel_reflection', y: 952, scale: 0.985 },
        { name: 'symbolsContainer', type: 'Container' },
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: 0,
          y: 60,
          Elements: [{ name: 'reelFrame', type: 'Sprite', image: 'reelFrame', x: 0, y: 0 }],
        },
        { name: '81waysLeft', type: 'Sprite', image: '81ways', x: 274, y: 70 },
        { name: '81waysRight', type: 'Sprite', image: '81ways', x: 1234, y: 70 },
        {
          name: 'modalRect',
          type: 'Graphics',
          width: 5000,
          height: 5000,
          x: -1000,
          y: -1000,
          color: 0xffff00,
          visible: false,
        },
        {
          name: 'potAnim',
          type: 'Spine',
          spineName: 'Pot_spine',
          defaultState: 'idle',
          loop: true,
          scale: 0.5,
          layoutData: {
            Desktop: { scale: 0.5, x: 0, y: 800 },
            DesktopPortrait: { scale: 0.5, x: 345, y: -50 },
            Landscape: { scale: 0.5, x: 0, y: 800 },
            Portrait: { scale: 0.5, x: 345, y: -50 },
          },
        },
        TICKER_COMP_CONFIG,
        REEL_WIN_TICKER_CONFIG,
        FSAUTO_COUNTER_CONFIG,
        {
          name: 'gameTitle',
          type: 'Spine',
          spineName: 'R81_Logo_Spine',
          defaultState: 'Static',
          anchor: { x: 0.5, y: 0.5 },
          boundingBox: { width: 560, height: 200 },
          layoutData: {
            Desktop: {
              scale: 0.8,
              x: 580,
              y: -10,
            },
            Landscape: {
              scale: 0.8,
              x: 580,
              y: -10,
            },
            Portrait: { scale: 0.8, x: 580, y: -10 },
          },
        },
        { name: 'maskRect', type: 'Graphics', width: 1300, height: 710, x: 132, y: 160, color: 0xffff00 },
        {
          name: 'winSymbolsContainer',
          type: 'Container',
          Elements: [
            {
              name: 'symbolPayoutComp',
              type: 'Comp',
              class: SymbolPayoutComp,
              xPadding: 0.02,
              textXPadding: 0.08,
              Elements: [
                { name: 'bg', type: 'Sprite', image: 'symbolPaytableBG' },
                {
                  name: 'infoText',
                  type: 'Text',
                  style: { fontFamily: 'gameFont1', fontSize: 25, fill: 0x64cdff, wordWrap: true, wordWrapWidth: 200 },
                },
              ],
            },
          ],
        },
        {
          name: 'lineWinAmountComp',
          type: 'Comp',
          class: GameLineWinAmountComp,
          y: 200,
          Elements: [
            {
              name: 'multiplierImg',
              type: 'Sprite',
              image: 'x2',
              anchor: { x: 0.5, y: 0.5 },
              y: -60,
            },
            {
              name: 'valueText',
              type: 'BitmapText',
              anchor: { x: 0.5, y: 0.5 },
              style: { fontFamily: 'bitmapFont', fontSize: 180, fill: 0xffffff },
            },
          ],
        },
      ],
    },
    BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.7,
      heightPerc: 0.8,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: -0.02,
      hPaddingPerc: 0,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
