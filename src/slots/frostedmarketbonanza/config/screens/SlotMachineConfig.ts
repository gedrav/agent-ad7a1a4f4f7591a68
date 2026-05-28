import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { TICKER_COMP_CONFIG } from '@game/config/screens/TickerCompConfig';
import { FSAUTO_COUNTER_CONFIG } from '@game/config/screens/FSAutoCounterConfig';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';
import CascadeReelSymbol from '@brand/views/slot/CascadeReelSymbol';
import WinController from '@core/views/slotmachine/WinController';
import { ANTE_BET_CONFIG } from '@game/config/screens/AnteBetConfig';
import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { BUY_BONUS_BTN_CONFIG } from '@game/config/screens/BuyBonusButtonConfig';
import { WinValueComp } from '@game/views/comps/WinValueComp';
import { BetValueComp } from '@brand/views/comps/BetValueComp';
import FMBMultiplierSlotReelCascade from '@slots/frostedmarketbonanza/views/slot/FMBMultiplierSlotReelCascade';
import { ArtilleryComp } from '@slots/frostedmarketbonanza/views/comps/ArtilleryComp';
import { FMBReelFrameComp } from '@slots/frostedmarketbonanza/views/comps/FMBReelFrameComp';
export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xffff00,
      width: 1955,
      height: 1526,
      lWidth: 2200,
      lHeight: 1600,
      pWidth: 1450,
      pHeight: 1600,
      alpha: 0,
    },

    {
      name: 'slotReel',
      type: 'Comp',
      class: FMBMultiplierSlotReelCascade,
      winController: WinController,
      x: 260,
      y: 90,
      px: 5,
      py: 110,
      lx: 375,
      ly: 135,
      data: {
        symbolClass: CascadeReelSymbol,
        noOfReels: 6,
        noOfRows: 5,
        isFixedSymbol: true,
        winValueComponent: WinValueComp,
        reelHeight: 1200,
        landingSymbols: ['SC', 'BN_G', 'BN_B', 'BN_P', 'BN_R'],
        reelsConfig: ReelsConfig,
        multiplierTextConfig: {
          name: 'multiplierVal',
          type: 'BitmapText',
          anchor: { x: 0.5, y: 0.5 },
          x: -8,
          y: -30,
          style: { fontFamily: 'bitmapFont', fill: 0xffffff, fontSize: 140, letterSpacing: -10 },
        },
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 180, y: 286 },
            reelPositionX: [0, 210, 424, 640, 860, 1076],
            symbolHeight: 200,
          },
          Portrait: {
            reelContainerPos: { x: 180, y: 286 },
            reelPositionX: [0, 210, 424, 640, 860, 1076],
            symbolHeight: 200,
          },
          Landscape: {
            reelContainerPos: { x: 180, y: 286 },
            reelPositionX: [0, 210, 424, 640, 860, 1076],
            symbolHeight: 200,
          },
        },
        initialReel: [
          ['H1', 'L3', 'L4', 'H3', 'L2'],
          ['L1', 'H2', 'L2', 'L1', 'H4'],
          ['H3', 'L4', 'L1', 'L5', 'L1'],
          ['L4', 'L1', 'H3', 'H1', 'L3'],
          ['L2', 'L4', 'H1', 'L5', 'L3'],
          ['L1', 'L4', 'H2', 'H4', 'L1'],
        ],
        symbolsData: {
          SC: {
            name: 'SC',
            spineName: 'scatter',
            idleAnim: 'idle',
            landing: 'landing',
            winAnim: 'win',
            animScale: 0.41,
          },
          H1: {
            name: 'H1',
            spineName: 'cupcake',
            idleAnim: 'idle',
            winAnim: 'win',
            appearAnim: 'appear',
            isBonusSymbol: false,
            animScale: 0.77,
          },
          H2: {
            name: 'H2',
            spineName: 'cookies',
            idleAnim: 'idle',
            winAnim: 'win',
            appearAnim: 'appear',
            isBonusSymbol: false,
            animScale: 0.78,
          },
          H3: {
            name: 'H3',
            spineName: 'pie',
            idleAnim: 'idle',
            winAnim: 'win',
            appearAnim: 'appear',
            isBonusSymbol: false,
            animScale: 0.78,
          },
          H4: {
            name: 'H4',
            spineName: 'cake',
            idleAnim: 'idle',
            winAnim: 'win',
            appearAnim: 'appear',
            isBonusSymbol: false,
            animScale: 0.78,
          },
          L1: {
            name: 'L1',
            spineName: 'low_green',
            idleAnim: 'idle',
            winAnim: 'win2',
            disapperAnim: 'win3',
            isBonusSymbol: false,
            animScale: 0.71,
          },
          L2: {
            name: 'L2',
            spineName: 'low_red',
            idleAnim: 'idle',
            winAnim: 'win2',
            disapperAnim: 'win3',
            isBonusSymbol: false,
            animScale: 0.72,
          },
          L3: {
            name: 'L3',
            spineName: 'low_yellow',
            idleAnim: 'idle',
            winAnim: 'win2',
            disapperAnim: 'win3',
            isBonusSymbol: false,
            animScale: 0.7,
          },
          L4: {
            name: 'L4',
            spineName: 'low_spin',
            idleAnim: 'idle',
            winAnim: 'win2',
            disapperAnim: 'win3',
            isBonusSymbol: false,
            animScale: 0.73,
          },
          L5: {
            name: 'L5',
            spineName: 'low_candy',
            idleAnim: 'idle',
            winAnim: 'win2',
            disapperAnim: 'win3',
            isBonusSymbol: false,
            animScale: 0.7,
          },
          BN: {
            name: 'BN',
            isBonusSymbol: true,
          },
        },
      },
      Elements: [
        {
          name: 'reelFrame',
          type: 'Comp',
          class: FMBReelFrameComp,
          x: -40,
          y: 56,
          Elements: [
            {
              name: 'reelFrameAnim',
              type: 'Spine',
              spineName: 'reel',
              defaultState: 'animation',
              loop: true,
              scale: 0.9,
              boundingBox: { width: 1700, height: 1350 },
              x: 0,
              y: 0,
            },
          ],
        },
        { name: 'symbolsContainer', type: 'Container' },
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
        { name: 'tickerbg', type: 'Sprite', image: 'last_win', x: 19, y: 1210 },
        TICKER_COMP_CONFIG,
        REEL_WIN_TICKER_CONFIG,
        FSAUTO_COUNTER_CONFIG,
        {
          name: 'artilleryComp',
          type: 'Comp',
          class: ArtilleryComp,
          Elements: [
            {
              name: 'artilleryL',
              type: 'Spine',
              spineName: 'Cannon_spine',
              defaultState: '',
              scale: { x: -0.9, y: 0.9 },
            },
            {
              name: 'artilleryR',
              type: 'Spine',
              spineName: 'Cannon_spine',
              defaultState: '',
              scale: 0.9,
              x: 406,
            },
          ],
          layoutData: {
            Desktop: {
              x: 506,
            },
          },
        },
        {
          name: 'gameTitle',
          type: 'Sprite',
          image: 'gameLogo',
          anchor: { x: 0.5, y: 0.5 },
          layoutData: {
            Desktop: {
              x: 710,
              y: 38,
            },
          },
        },
        {
          name: 'maskRect',
          type: 'Graphics',
          width: 1280,
          height: 1035,
          x: 78,
          y: 172,
          color: 0xff0000,
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
                  style: { fontFamily: 'gameFont1', fontSize: 25, fill: 0x64cdff, wordWrap: true, wordWrapWidth: 240 },
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
          x: 710,
          y: 680,
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
              style: { fontFamily: 'commonFont', fontSize: 60, fill: 0xffd700, fontWeight: 700 },
            },
            {
              name: 'betValueText',
              type: 'Text',
              anchor: { x: 0, y: 0.5 },
              style: { fontFamily: 'commonFont', fontSize: 60, fill: 0xffffff, fontWeight: 700 },
            },
          ],
        },
      ],
    },
    BUY_BONUS_BTN_CONFIG,
    ANTE_BET_CONFIG,
    BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.94,
      heightPerc: 0.96,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0,
      hPaddingPerc: 0,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.1 },
    SmallPortrait: { widthPerc: 1.3, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.1 },
    Landscape: { widthPerc: 0.7, heightPerc: 1, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
  },
};
