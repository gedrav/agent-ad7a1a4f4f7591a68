import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { TICKER_COMP_CONFIG } from '@game/config/screens/TickerCompConfig';
import { FSAUTO_COUNTER_CONFIG } from '@game/config/screens/FSAutoCounterConfig';
import { REEL_WIN_TICKER_CONFIG } from '@game/config/screens/ReelWinTickerConfig';
import RewardSymbol from '@brand/views/slot/RewardSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import WinController from '@core/views/slotmachine/WinController';
import { WIN_COLLECTOR_CONFIG } from '@slots/empireofgold/config/screens/WinCollectorConfig';
import { ANTE_BET_CONFIG } from '@game/config/screens/AnteBetConfig';
import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { BUY_BONUS_BTN_CONFIG } from '@game/config/screens/BuyBonusButtonConfig';
import { FS_TOTAL_MULTI_CONFIG } from './FsTotalMultiplierConfig';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xffff00,
      width: 2140,
      height: 1440,
      lWidth: 2140,
      lHeight: 1440,
      pWidth: 1400,
      pHeight: 1830,
      alpha: 0,
    },

    {
      name: 'slotReel',
      type: 'Comp',
      class: MultiplierSlotReelCascade,
      winController: WinController,
      x: 220,
      y: 120,
      px: -150,
      py: 490,
      lx: 220,
      ly: 120,
      data: {
        symbolClass: RewardSymbol,
        noOfReels: 6,
        noOfRows: 5,
        isFixedSymbol: true,
        reelHeight: 1200,
        reelsConfig: ReelsConfig,
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 310, y: 190 },
            reelPositionX: [0, 216, 434, 650, 870, 1080],
            symbolHeight: 210,
            symbolScale: 0.8,
          },
          Portrait: {
            reelContainerPos: { x: 310, y: 190 },
            reelPositionX: [0, 216, 434, 650, 870, 1080],
            symbolHeight: 210,
            symbolScale: 0.8,
          },
          Landscape: {
            reelContainerPos: { x: 310, y: 190 },
            reelPositionX: [0, 216, 434, 650, 870, 1080],
            symbolHeight: 210,
            symbolScale: 0.8,
          },
        },

        symbolsData: {
          SC: {
            name: 'SC',
            spineName: 'scatter',
            idleAnim: 'idle',
            landing: 'landing',
            winAnim: 'win',
            winAnim2: 'win2',
            animScale: 1,
          },
          H1: {
            name: 'H1',
            spineName: 'chest',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 1,
          },
          H2: {
            name: 'H2',
            spineName: 'book',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 1,
          },
          H3: {
            name: 'H3',
            spineName: 'shield',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 1,
          },
          H4: {
            name: 'H4',
            spineName: 'cup',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 1,
          },
          L1: {
            name: 'L1',
            spineName: 'low_1',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 0.82,
            scale: 0.82,
          },
          L2: {
            name: 'L2',
            spineName: 'low_2',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 0.82,
            scale: 0.82,
          },
          L3: {
            name: 'L3',
            spineName: 'low_3',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 0.82,
            scale: 0.82,
          },
          L4: {
            name: 'L4',
            spineName: 'low_4',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 0.82,
            scale: 0.82,
          },
          L5: {
            name: 'L5',
            spineName: 'low_5',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
            animScale: 0.82,
            scale: 0.82,
          },
          // todo: write logic bind sprites with bn symbols and remove these dummy symbols
          BN: { name: 'multi_blue', isBonusSymbol: false },
          BN_1: { name: 'multi_blue', isBonusSymbol: true },
          BN_2: { name: 'multi_blue', isBonusSymbol: true },
          BN_3: { name: 'multi_blue', isBonusSymbol: true },
          BN_4: { name: 'multi_blue', isBonusSymbol: true },
          BN_5: { name: 'multi_blue', isBonusSymbol: true },
          BN_6: { name: 'multi_blue', isBonusSymbol: true },
          BN_7: { name: 'multi_blue', isBonusSymbol: true },
          BN_8: { name: 'multi_blue', isBonusSymbol: true },
          //-----------------------
          S_SC: { name: 'SC', isBonusSymbol: false },
        },
      },
      Elements: [
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: 0,
          y: 0,
          Elements: [
            {
              name: 'reelFrame',
              type: 'Spine',
              spineName: 'reels_frame',
              defaultState: 'loop',
              loop: true,
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
        {
          name: 'kingAnim',
          type: 'Spine',
          spineName: 'king_pers',
          defaultState: 'idle',
          loop: true,
          defaultSkin: 'main',
          layoutData: {
            Desktop: { scale: 0.7, x: 1900, y: 900 },
            Landscape: { scale: 0.7, x: 1840, y: 800 },
            Portrait: { scale: 0.7, x: 855, y: -150 },
          },
        },
        { name: 'tickerbg', type: 'Sprite', image: 'last_win', x: 180, y: 1160 },
        TICKER_COMP_CONFIG,
        REEL_WIN_TICKER_CONFIG,
        FS_TOTAL_MULTI_CONFIG,
        FSAUTO_COUNTER_CONFIG,
        {
          name: 'gameTitle',
          type: 'Sprite',
          image: 'empireLogo',
          anchor: { x: 0.5, y: 0.5 },
          layoutData: {
            Desktop: {
              scale: 0.7,
              x: 852,
              y: -20,
            },
            Landscape: {
              scale: 0.6,
              x: 862,
              y: -24,
            },
            Portrait: { scale: 0.5, x: 862, y: -24 },
          },
        },
        {
          name: 'maskRect',
          type: 'Graphics',
          width: 1300,
          height: 1050,
          x: 197,
          y: 86,
          color: 0xffff00,
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
      ],
    },
    BUY_BONUS_BTN_CONFIG,
    ANTE_BET_CONFIG,
    WIN_COLLECTOR_CONFIG,
    BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.8,
      heightPerc: 1,
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
