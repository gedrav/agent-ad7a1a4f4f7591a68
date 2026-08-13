import { JackPotItem } from '@brand/views/comps/JackPotItem';
import { JackpotPanelComp } from '@brand/views/comps/JackpotPanelComp';
import { WinTicker } from '@core/views/comps/WinTicker';

export const JACKPOT_PANEL_CONFIG: any = {
  name: 'jackpotContainer',
  type: 'Comp',
  class: JackpotPanelComp,
  jackpotConfig: {
    noOfElement: 4,
    jackpotContent: ['bronzeTitle', 'silverTitle', 'goldTitle', 'diamondTitle'],
    jackpotAnimSkin: ['bronze', 'silver', 'gold', 'diamond'],
    jackpotTextColor: [0xff9c55, 0xcac2b8, 0xedd94b, 0x64cdff],
    jackpotAnimState: [
      { state: 'idle', loop: true },
      { state: 'win', loop: true },
    ],
    items: {
      name: 'jackPotItem',
      type: 'Container',
      Elements: [
        {
          name: 'jackpotBg',
          type: 'Spine',
          spineName: 'jakpots',
          defaultState: 'idle',
          defaultSkin: 'bronze',
          loop: true,
          scale: 1,
          x: 0,
          y: 0,
        },
        { name: 'txtRect', type: 'Graphics', width: 752, height: 100, x: -90, alpha: 0 },
        {
          name: 'value',
          type: 'Text',
          style: { fontFamily: 'commonFont', fontSize: 110, fill: 0x64cdff },
          content: '',
          x: 272,
          anchor: { x: 0.5, y: 0.5 },
        },
      ],
    },
  },
  Elements: [
    { name: 'overlayRect', type: 'Graphics', width: 100, height: 100, alpha: 0.3, color: 0x000000 },
    {
      name: 'jackpotIntroAnimHor',
      type: 'Spine',
      spineName: 'jp_jackpots',
      defaultState: '',
      scale: 1,
      x: 0,
      y: 0,
      boundingBox: { width: 1550, height: 1550 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', widthPerc: 1 },
        Portrait: { hAlign: 'center', vAlign: 'middle', widthPerc: 1 },
        Landscape: { hAlign: 'center', vAlign: 'middle', widthPerc: 1 },
      },
    },
    {
      name: 'jackpotIntroAnimVer',
      type: 'Spine',
      spineName: 'jp_jackpots',
      defaultState: 'idle_port',
      scale: 1,
      x: 0,
      y: 0,
      boundingBox: { width: 1550, height: 1550 },
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Portrait: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
        Landscape: { hAlign: 'center', vAlign: 'middle', fitToScreen: true },
      },
    },
    {
      name: 'jackpotWinContainer',
      type: 'Container',
      Elements: [
        {
          name: 'jpguideRect',
          type: 'Graphics',
          width: 1400,
          height: 1200,
          pWidth: 650,
          pHeight: 1200,
          lWidth: 1400,
          lHeight: 1200,
          alpha: 0,
        },
        {
          name: 'jackPotOutroAnimation',
          type: 'Spine',
          spineName: 'jp_wins',
          defaultState: 'start_land',
          scale: 1,
          x: 0,
          y: 600,
        },
        { name: 'youwinJPTextimg', type: 'Sprite', image: 'YouwinJP', anchor: { x: 0.5, y: 0.5 }, y: 448 },
        {
          name: 'winTickerJP',
          type: 'Comp',
          class: WinTicker,
          x: 0,
          y: 566,
          Elements: [
            {
              name: 'valueText',
              type: 'BitmapText',
              contentText: 500,
              anchor: { x: 0.5, y: 0.5 },
              style: { fontFamily: 'bitmapFontJP', fontSize: 380, fill: 0xffffff },
            },
          ],
        },
      ],
      layoutData: {
        Desktop: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: 0.5, widthPerc: 1, vPaddingPerc: 0 },
        Portrait: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: 0.5, widthPerc: 1, vPaddingPerc: 0 },
        Landscape: { hAlign: 'center', vAlign: 'middle', hPaddingPerc: 0.5, widthPerc: 1, vPaddingPerc: 0 },
      },
    },
  ],
  layoutData: {},
};
