import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import GameWinController from '@game/views/slot/GameWinController';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { GameLineWinAmountComp } from '@game/views/comps/GameLineWinAmountComp';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { TICKER_COMP_CONFIG } from '@game/config/screens/TickerCompConfig';
import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { FSAUTO_COUNTER_CONFIG } from '@game/config/screens/FSAutoCounterConfig';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';
import { BetValueComp } from '@brand/views/comps/BetValueComp';
import { ReelStripBG } from '@game/views/comps/ReelStripBG';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 1354,
      height: 1030,
      alpha: 0,
    },

    {
      name: 'slotReel',
      type: 'Comp',
      class: SlotReelStandard,
      winController: GameWinController,
      x: -100,
      y: 10,
      data: {
        symbolClass: ReelSymbolSpine,
        noOfReels: 5,
        noOfRows: 3,
        reelHeight: 660,
        reelsConfig: ReelsConfig,
        landingSymbols: ['WD'],
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 270, y: 285 },
            reelPositionX: [-30, 232, 505, 777, 1040],
            symbolHeight: 236,
            symbolScale: 1,
          },
          Portrait: {
            reelContainerPos: { x: 270, y: 285 },
            reelPositionX: [-30, 232, 505, 777, 1040],
            symbolHeight: 236,
            symbolScale: 1,
          },
          Landscape: {
            reelContainerPos: { x: 270, y: 285 },
            reelPositionX: [-30, 232, 505, 777, 1040],
            symbolHeight: 236,
            symbolScale: 1,
          },
        },
        initialReel: [
          ['H1', 'L3', 'L4'],
          ['L1', 'H2', 'L2'],
          ['H3', 'L4', 'L1'],
          ['L2', 'L1', 'H3'],
          ['L4', 'L1', 'H3'],
        ],
        symbolsData: {
          WD: {
            name: 'WD',
            spineName: 'Book',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          H1: {
            name: 'H1',
            spineName: 'StormSeeker',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          H2: {
            name: 'H2',
            spineName: 'eagle',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          H3: {
            name: 'H3',
            spineName: 'Mask',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          H4: {
            name: 'H4',
            spineName: 'Castle',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          L1: {
            name: 'L1',
            spineName: 'A',
            skin: 'default',
            winAnim1: 'win',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 0.9,
          },
          L2: {
            name: 'L2',
            spineName: 'K',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 0.9,
          },
          L3: {
            name: 'L3',
            spineName: 'Q',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 0.9,
          },
          L4: {
            name: 'L4',
            spineName: 'J',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 0.9,
          },
          L5: {
            name: 'L5',
            spineName: '10',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 0.9,
          },
        },
      },
      Elements: [
        {
          name: 'reelstripBG',
          type: 'Comp',
          class: ReelStripBG,
          x: 0,
          y: 0,
          // visible: false,
          Elements: [
            {
              name: 'bg',
              type: 'Sprite',
              image: 'bg',
              x: 42,
              y: 87,
            },
          ],
        },
        { name: 'symbolsContainer', type: 'Container' },
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: -32,
          y: 0,
          Elements: [
            {
              name: 'reelFrame',
              type: 'Sprite',
              image: 'reels_frame',
              x: 73,
              y: 85,
            },
          ],
        },
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
        { name: 'tickerbg', type: 'Sprite', image: 'last_win', x: 60, y: 905, scale: 1.05 },
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
        { name: 'maskRect', type: 'Graphics', width: 1315, height: 710, x: 117, y: 165, color: 0xffff00 },
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
                  style: { fontFamily: 'gameFont1', fontSize: 25, fill: 0x64cdff, wordWrap: true, wordWrapWidth: 210 },
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
        {
          name: 'betValueContainer',
          type: 'Comp',
          class: BetValueComp,
          x: 816,
          y: 510,
          padX: 40,
          padY: 15,
          gap: 30,
          visible: false,
          isMobileOnly: true,
          Elements: [
            {
              name: 'betValueBg',
              type: 'ResponsiveGraphics',
              alpha: 0.8,
              width: 180,
              height: 70,
              radius: 16,
              color: 0x000000,
            },
            {
              name: 'betLabelText',
              type: 'Text',
              content: 'BetText',
              toUpperCase: true,
              anchor: { x: 0, y: 0.5 },
              style: { fontFamily: 'commonFont', fontSize: 44, fill: 0xffd700, fontWeight: 700 },
            },
            {
              name: 'betValueText',
              type: 'Text',
              anchor: { x: 0, y: 0.5 },
              style: { fontFamily: 'commonFont', fontSize: 44, fill: 0xffffff, fontWeight: 700 },
            },
          ],
        },
      ],
    },
    BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.85,
      heightPerc: 1,
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
