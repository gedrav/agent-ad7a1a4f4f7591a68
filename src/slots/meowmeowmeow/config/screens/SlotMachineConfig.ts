import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import GameWinController from '@game/views/slot/GameWinController';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { TICKER_COMP_CONFIG } from '@game/config/screens/TickerCompConfig';
import ReelSymbolSpine from '@core/views/slotmachine/ReelSymbolSpine';
import { FSAUTO_COUNTER_CONFIG } from '@game/config/screens/FSAutoCounterConfig';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';
import { BetValueComp } from '@brand/views/comps/BetValueComp';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { BookSlotReel } from '@game/views/slot/BookSloReel';
import { KITTIEBANK_CONFIG } from './KittieBankConfig';
import { JACKPOT_CONFIG } from './JackpotConfig';
import { GameSlotReel } from '@slots/meowmeowmeow/views/slot/GameSlotReel';
import { JP_BANNER_ANIM_CONFIG } from '@slots/meowmeowmeow/config/screens/JPAnimsConfig';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 2200,
      height: 1456,
      pWidth: 1660,
      pHeight: 2200,
      lWidth: 2300,
      lHeight: 1456,
      alpha: 0,
    },
    JACKPOT_CONFIG,
    {
      name: 'slotReel',
      type: 'Comp',
      class: GameSlotReel,
      winController: GameWinController,
      layoutData: {
        Desktop: { x: 450, y: 274 },
        Portrait: { x: 0, y: 1000 },
        Landscape: { x: 450, y: 224 },
      },
      data: {
        symbolClass: ReelSymbolSpine,
        noOfReels: 5,
        noOfRows: 3,
        reelHeight: 900,
        reelsConfig: ReelsConfig,
        landingSymbols: ['WD', 'SC'],
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 195, y: 230 },
            reelPositionX: [0, 332, 662, 990, 1320],
            symbolHeight: 330,
            symbolScale: 1,
          },
          Portrait: {
            reelContainerPos: { x: 195, y: 230 },
            reelPositionX: [0, 332, 662, 990, 1320],
            symbolHeight: 330,
            symbolScale: 1,
          },
          Landscape: {
            reelContainerPos: { x: 195, y: 230 },
            reelPositionX: [0, 332, 662, 990, 1320],
            symbolHeight: 330,
            symbolScale: 1,
          },
        },
        initialReel: [
          ['WD', 'L1', 'L3'],
          ['SC', 'L2', 'L4'],
          ['H2', 'WD', 'L5'],
          ['H3', 'H5', 'L4'],
          ['H4', 'H3', 'WD'],
        ],
        symbolsData: {
          RC: {
            name: 'RC',
            animScale: 0.65,
          },
          BC: {
            name: 'BC',
            animScale: 0.65,
          },
          GC: {
            name: 'GC',
            animScale: 0.65,
          },
          WD: {
            name: 'WD',
            spineName: 'WDSymbolAnim',
            skin: 'default',
            idleAnim: 'Ideal',
            landingAnim: 'Landing',
            winAnim: 'Win',
            animScale: 1,
          },
          SC: {
            name: 'SC',
            spineName: 'SCSymbolAnim',
            skin: 'default',
            idleAnim: 'Ideal',
            landingAnim: 'Landing',
            winAnim: 'Win',
            animScale: 1,
          },
          H1: {
            name: 'H1',
            spineName: 'CoinPouch',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          H2: {
            name: 'H2',
          },
          H3: {
            name: 'H3',
          },
          H4: {
            name: 'H4',
            spineName: 'WoolenBall',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          H5: {
            name: 'H5',
          },
          L1: {
            name: 'L1',
            spineName: 'A',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          L2: {
            name: 'L2',
            spineName: 'K',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          L3: {
            name: 'L3',
            spineName: 'Q',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          L4: {
            name: 'L4',
            spineName: 'J',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
          L5: {
            name: 'L5',
            spineName: '10',
            skin: 'default',
            idleAnim: 'idle',
            winAnim: 'win',
            animScale: 1,
          },
        },
      },
      Elements: [
        {
          name: 'reelstripBG',
          type: 'Sprite',
          image: 'reelframebg',
          x: 34,
          y: 62,
          px: -4,
          py: 62,
          lx: 34,
          ly: 62,
        },
        { name: 'symbolsContainer', type: 'Container' },
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: 0,
          y: 0,
          px: -26,
          py: 0,
          lx: 0,
          ly: 0,
          Elements: [
            {
              name: 'reelFrame',
              type: 'Sprite',
              image: 'ReelFrame',
              x: 0,
              y: 0,
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
        TICKER_COMP_CONFIG,
        REEL_WIN_TICKER_CONFIG,
        FSAUTO_COUNTER_CONFIG,
        {
          name: 'maskRect',
          type: 'Graphics',
          width: 1666,
          height: 988,
          x: 30,
          y: 68,
          color: 0xffff00,
          alpha: 1,
          visible: true,
        },
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
          class: LineWinAmountComp,
          y: 200,
          Elements: [
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
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'gamelogo',
      anchor: { x: 0.5, y: 0.5 },
      layoutData: {
        Desktop: { scale: 1, x: 1300, y: 60 },
        Landscape: { scale: 1, x: 1300, y: 60 },
        Portrait: { scale: 1, x: 840, y: 60 },
      },
    },
    KITTIEBANK_CONFIG,
    BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.8,
      heightPerc: 0.9,
      hAlign: 'center',
      vAlign: 'middle',
      maxScale: 1,
      vPaddingPerc: 0,
      hPaddingPerc: 0,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.68, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.1 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
  },
};
