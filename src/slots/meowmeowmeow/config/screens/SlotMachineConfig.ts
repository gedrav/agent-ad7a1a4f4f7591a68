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
      height: 1416,
      pWidth: 1420,
      pHeight: 1150,
      lWidth: 1610,
      lHeight: 1140,
      alpha: 0.9,
    },
    {
      name: 'slotReel',
      type: 'Comp',
      class: BookSlotReel,
      winController: GameWinController,
      layoutData: {
        Desktop: { x: 0, y: 0 },
        Portrait: { x: -65, y: 50 },
        Landscape: { x: 25, y: 150 },
      },
      data: {
        symbolClass: ReelSymbolSpine,
        noOfReels: 5,
        noOfRows: 3,
        reelHeight: 800,
        reelsConfig: ReelsConfig,
        landingSymbols: ['WD', 'SC'],
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 646, y: 468 },
            reelPositionX: [0, 332, 662, 990, 1320],
            symbolHeight: 322,
            symbolScale: 1,
          },
          Portrait: {
            reelContainerPos: { x: 646, y: 468 },
            reelPositionX: [0, 332, 662, 990, 1320],
            symbolHeight: 315,
            symbolScale: 1,
          },
          Landscape: {
            reelContainerPos: { x: 646, y: 468 },
            reelPositionX: [0, 332, 662, 990, 1320],
            symbolHeight: 315,
            symbolScale: 1,
          },
        },
        initialReel: [
          ['H1', 'L1', 'L3'],
          ['SC', 'L2', 'L4'],
          ['H2', 'WD', 'L5'],
          ['H3', 'pot', 'paw_red'],
          ['H4', 'paw_green', 'paw_blue'],
        ],
        symbolsData: {
          paw_red: {
            name: 'paw_red',
            animScale: 0.65,
          },
          paw_blue: {
            name: 'paw_blue',
            animScale: 0.65,
          },
          paw_green: {
            name: 'paw_green',
            animScale: 0.65,
          },
          pot: {
            name: 'pot',
            animScale: 0.65,
          },
          WD: {
            name: 'WD',
          },
          SC: {
            name: 'SC',
          },
          H1: {
            name: 'H1',
          },
          H2: {
            name: 'H2',
          },
          H3: {
            name: 'H3',
          },
          H4: {
            name: 'H4',
          },
          L1: {
            name: 'L1',
          },
          L2: {
            name: 'L2',
          },
          L3: {
            name: 'L3',
          },
          L4: {
            name: 'L4',
          },
          L5: {
            name: 'L5',
          },
        },
      },
      Elements: [
        JACKPOT_CONFIG,
        {
          name: 'reelstripBG',
          type: 'Sprite',
          image: 'reelframebg',
          x: 482,
          y: 286,
        },
        { name: 'symbolsContainer', type: 'Container' },
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: 450,
          y: 224,
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
        {
          name: 'gameTitle',
          type: 'Sprite',
          image: 'gamelogo',
          anchor: { x: 0.5, y: 0.5 },
          layoutData: {
            Desktop: { scale: 0.7, x: 1300, y: 60 },
            Landscape: { scale: 0.9, x: 780, y: -230 },
            Portrait: { scale: 0.9, x: 710, y: -350 },
          },
        },
        TICKER_COMP_CONFIG,
        REEL_WIN_TICKER_CONFIG,
        FSAUTO_COUNTER_CONFIG,
        {
          name: 'maskRect',
          type: 'Graphics',
          width: 1666,
          height: 988,
          x: 474,
          y: 288,
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
        KITTIEBANK_CONFIG,
      ],
    },
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
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.94, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
    SmallLandscape: { widthPerc: 0.7, heightPerc: 0.88, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
