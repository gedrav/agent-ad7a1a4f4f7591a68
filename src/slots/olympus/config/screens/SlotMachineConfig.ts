import { GameSlotMachineView } from '@game/views/slot/GameSlotMachineView';
import WinController from '@core/views/slotmachine/WinController';
import ReelSymbolSprite from '@core/views/slotmachine/ReelSymbolSprite';
import { ReelsConfig } from '@game/config/ReelsConfig';
import { LineWinAmountComp } from '@core/views/comps/LineWinAmountComp';
import { BIG_WIN_CONFIG } from '@game/config/screens/BigWinConfig';
import SlotReelTumble from '@core/views/slotmachine/SlotReelTumble';
import { MultiplierComp } from '@game/views/comps/MultiplierComp';
import { MultiComp } from '@game/views/comps/MultiComp';
import { MULTIPLIER_CONFIG } from '@game/config/screens/MultiplierCompConfig';
import { ReelFrameComp } from '@core/views/comps/ReelFrameComp';
import SlotReelCascade from '@core/views/slotmachine/SlotReelCascade';
import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { SymbolPayoutComp } from '@brand/views/comps/SymbolPayoutComp';

export const SLOT_MACHINE_CONFIG: any = {
  name: 'slotMachineView',
  type: 'Comp',
  class: GameSlotMachineView,
  Elements: [
    {
      name: 'guideRect',
      type: 'Graphics',
      color: 0xff0000,
      width: 1460,
      height: 1350,
      alpha: 0,
    },
    {
      name: 'slotReel',
      type: 'Comp',
      class: SlotReelCascade,
      winController: WinController,
      x: 0,
      y: 0,
      data: {
        symbolClass: ReelSymbolSprite,
        noOfReels: 6,
        noOfRows: 5,
        isFixedSymbol: true,
        reelHeight: 1200,
        reelsConfig: ReelsConfig,
        deviceLayout: {
          Desktop: {
            reelContainerPos: { x: 132, y: 276 },
            reelPositionX: [0, 238, 474, 714, 956, 1190],
            symbolHeight: 232,
            symbolScale: 0.44,
          },
          Portrait: {
            reelContainerPos: { x: 204, y: 358 },
            reelPositionX: [0, 350, 698, 1046, 1398],
            symbolHeight: 302,
            symbolScale: 0.4,
          },
          Landscape: {
            reelContainerPos: { x: 204, y: 358 },
            reelPositionX: [0, 350, 698, 1046, 1398],
            symbolHeight: 302,
            symbolScale: 0.4,
          },
        },

        symbolsData: {
          WD: { name: 'WD' },
          H1: { name: 'H1' },
          H2: { name: 'H2' },
          H3: { name: 'H3' },
          H4: { name: 'H4' },
          L1: { name: 'L1' },
          L2: { name: 'L2' },
          L3: { name: 'L3' },
          L4: { name: 'L4' },
          L5: { name: 'L5' },
          BN: { name: 'L5' },
          SC: { name: 'SC' },
          S_SC: { name: 'SC' },
        },
      },
      Elements: [
        {
          name: 'reelFrame',
          type: 'Comp',
          class: ReelFrameComp,
          x: 0,
          y: 130,
          Elements: [
            { name: 'reelFrame', type: 'Sprite', image: 'reelFrame', x: 0, y: 0 },
            { name: 'reelFrameFS', type: 'Sprite', image: 'reelFrameFS', y: 0, visible: false },
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
          name: 'tickerComp',
          type: 'Comp',
          class: ReelTickerComp,
          tickerDelay: 8000,
          x: 0,
          y: 0,
          content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5'],
          contentYPadding: -2,
          Elements: [
            { name: 'fsbg', type: 'Sprite', image: 'tickerBGFS' },
            { name: 'bg', type: 'Sprite', image: 'tickerBG' },
            {
              name: 'textCont',
              type: 'Container',
              Elements: [
                {
                  name: 'tickerText1',
                  type: 'Text',
                  anchor: { x: 0.5, y: 0.5 },
                  style: {
                    fontFamily: 'gameFont1',
                    fontSize: 44,
                    fill: 0xffffff,
                  },
                },
                {
                  name: 'tickerText2',
                  type: 'Text',
                  anchor: { x: 0.5, y: 0.5 },
                  style: {
                    fontFamily: 'gameFont1',
                    fontSize: 44,
                    fill: 0xffffff,
                  },
                },
                {
                  name: 'winText',
                  type: 'Text',
                  anchor: { x: 0.5, y: 0.5 },
                  style: {
                    fontFamily: 'gameFont1',
                    fontSize: 80,
                    fill: 0xffff00,
                  },
                },
              ],
            },
            { name: 'maskRect', type: 'Graphics', width: 1800, height: 88, x: 0, y: 12 },
          ],
        },
        { name: 'symbolsContainer', type: 'Container' },
        { name: 'maskRect', type: 'Graphics', width: 1430, height: 1168, x: 16, y: 154, color: 0xffff00 },
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
    Desktop: { widthPerc: 0.76, heightPerc: 0.84, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Portrait: { widthPerc: 1, heightPerc: 0.6, hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.02 },
    Landscape: { widthPerc: 0.9, heightPerc: 0.9, hAlign: 'center', vAlign: 'top', vPaddingPerc: 0.002 },
  },
};
