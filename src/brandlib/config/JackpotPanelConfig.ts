import { JackPotItem } from '@brand/views/comps/JackPotItem';
import { JackpotPanelComp } from '@brand/views/comps/JackpotPanelComp';

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
        {
          name: 'value',
          type: 'Text',
          style: { fontFamily: 'gameFont1', fontSize: 110, fill: 0x64cdff, wordWrap: true, wordWrapWidth: 210 },
          content: '',
          x: 140,
          anchor: { x: 0.5, y: 0.5 },
        },
      ],
    },
  },
  Elements: [],
  layoutData: {},
};
