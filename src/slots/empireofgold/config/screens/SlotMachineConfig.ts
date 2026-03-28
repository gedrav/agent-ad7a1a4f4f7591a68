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
import RewardSymbol from '@brand/views/slot/RewardSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import WinController from '@core/views/slotmachine/WinController';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xffff00,
      width: 1360,
      height: 1430,
      alpha: 0,
    },

    {
      name: 'slotReel',
      type: 'Comp',
      class: MultiplierSlotReelCascade,
      winController: WinController,
      x: -170,
      y: 100,
      data: {
        symbolClass: ReelSymbolSpine,
        noOfReels: 6,
        noOfRows: 5,
        isFixedSymbol: true,
        reelHeight: 1200,
        reelsConfig: ReelsConfig,
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 300, y: 190 },
            reelPositionX: [0, 210, 434, 670, 890, 1090],
            symbolHeight: 210,
            symbolScale: 1,
          },
          Portrait: {
            reelContainerPos: { x: 300, y: 190 },
            reelPositionX: [0, 210, 434, 670, 890, 1090],
            symbolHeight: 210,
            symbolScale: 1,
          },
          Landscape: {
            reelContainerPos: { x: 300, y: 190 },
            reelPositionX: [0, 210, 434, 670, 890, 1090],
            symbolHeight: 210,
            symbolScale: 1,
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
          },
          H1: {
            name: 'H1',
            spineName: 'chest',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          H2: {
            name: 'H2',
            spineName: 'book',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          H3: {
            name: 'H3',
            spineName: 'shield',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          H4: {
            name: 'H4',
            spineName: 'cup',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          L1: {
            name: 'L1',
            spineName: 'low_1',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          L2: {
            name: 'L2',
            spineName: 'low_2',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          L3: {
            name: 'L3',
            spineName: 'low_3',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          L4: {
            name: 'L4',
            spineName: 'low_4',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          L5: {
            name: 'L5',
            spineName: 'low_5',
            idleAnim: 'idle',
            winAnim: 'win',
            cluster: 'cluster',
            isBonusSymbol: false,
          },
          BN: { name: 'L5', isBonusSymbol: false },
          BN_1: { name: 'BN_1', isBonusSymbol: true },
          BN_2: { name: 'BN_2', isBonusSymbol: true },
          BN_3: { name: 'BN_3', isBonusSymbol: true },
          BN_4: { name: 'BN_4', isBonusSymbol: true },
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
        TICKER_COMP_CONFIG,
        REEL_WIN_TICKER_CONFIG,
        FSAUTO_COUNTER_CONFIG,
        /*{
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
              y: -100,
            },
            Landscape: {
              scale: 0.8,
              x: 580,
              y: -100,
            },
            Portrait: { scale: 0.8, x: 580, y: -100 },
          },
        },*/
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
    //BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.7,
      heightPerc: 0.94,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: 0,
      hPaddingPerc: 0,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.7, heightPerc: 0.98, hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.002 },
  },
};
