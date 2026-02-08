import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import WinController from '@core/views/slotmachine/WinController';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';
import { TICKER_COMP_CONFIG } from '@game/config/screens/TickerCompConfig';
import { WIN_COLLECTOR_CONFIG } from './WinCollectorConfig';
import RewardSymbol from '@brand/views/slot/RewardSymbol';
import MultiplierSlotReelCascade from '@brand/views/slotmachine/MultiplierSlotReelCascade';
import { FS_TOTAL_MULTI_CONFIG } from './FsTotalMultiplierConfig';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import SlotReelStandard from '@core/views/slotmachine/SlotReelStandard';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 1600,
      height: 1030,
      alpha: 0,
    },
    {
      name: 'gameTitle',
      type: 'Sprite',
      image: 'gamelogo_splash',
      anchor: { x: 0.5, y: 0 },
      layoutData: {
        Desktop: {
          scale: 0.4,
          x: 800,
          y: -20,
        },
        Landscape: {},
        Portrait: {},
      },
    },
    {
      name: 'slotReel',
      type: 'Comp',
      class: SlotReelStandard,
      winController: WinController,
      x: 0,
      y: 10,
      data: {
        symbolClass: ReelSymbolSprite,
        noOfReels: 4,
        noOfRows: 3,
        reelHeight: 660,
        reelsConfig: ReelsConfig,
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 350, y: 324 },
            reelPositionX: [0, 300, 590, 890],
            symbolHeight: 212,
            symbolScale: 0.65,
          },
          Portrait: {
            reelContainerPos: { x: 350, y: 320 },
            reelPositionX: [0, 300, 590, 890],
            symbolHeight: 216,
            symbolScale: 0.65,
          },
          Landscape: {
            reelContainerPos: { x: 350, y: 320 },
            reelPositionX: [0, 300, 590, 890],
            symbolHeight: 216,
            symbolScale: 0.65,
          },
        },

        symbolsData: {
          WD: { name: 'WD', isBonusSymbol: false },
          H1: { name: 'H1', isBonusSymbol: false },
          H2: { name: 'H2', isBonusSymbol: false },
          H3: { name: 'H3', isBonusSymbol: false },
          H4: { name: 'H4', isBonusSymbol: false },
          H5: { name: 'H4', isBonusSymbol: false },
          L1: { name: 'L1', isBonusSymbol: false },
          L2: { name: 'L2', isBonusSymbol: false },
          L3: { name: 'L3', isBonusSymbol: false },
          L4: { name: 'L4', isBonusSymbol: false },
          L5: { name: 'L5', isBonusSymbol: false },
          SC: { name: 'SC', isBonusSymbol: false },
        },
      },
      Elements: [
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: 0,
          y: 130,
          Elements: [{ name: 'reelFrame', type: 'Sprite', image: 'reelFrame', x: 0, y: 0 }],
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
        //TICKER_COMP_CONFIG,
        { name: 'symbolsContainer', type: 'Container' },
        { name: 'maskRect', type: 'Graphics', width: 1280, height: 654, x: 160, y: 212, color: 0xffff00 },
        {
          name: 'winSymbolsContainer',
          type: 'Container',
          Elements: [
            {
              name: 'symbolPayoutComp',
              type: 'Comp',
              class: SymbolPayoutComp,
              xPadding: 0.06,
              textXPadding: 0.08,
              Elements: [
                { name: 'bg', type: 'Sprite', image: 'symbolPaytableBG' },
                {
                  name: 'infoText',
                  type: 'Text',
                  style: { fontFamily: 'gameFont1', fontSize: 60, fill: 0x201300, wordWrap: true, wordWrapWidth: 400 },
                },
              ],
            },
          ],
        },
        {
          name: 'lineWinAmountComp',
          type: 'Comp',
          class: LineWinAmountComp,
          Elements: [
            {
              name: 'valueText',
              type: 'BitmapText',
              anchor: { x: 0.5, y: 0.5 },
              style: { fontFamily: 'bitmapFont', fontSize: 120, fill: 0xffff00 },
            },
          ],
        },
      ],
    },
    BIG_WIN_CONFIG,
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.76,
      heightPerc: 0.84,
      hAlign: 'center',
      vAlign: 'middle',
      vPaddingPerc: -0.02,
      hPaddingPerc: -0.04,
    },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.9, heightPerc: 0.9, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
