import { JackPotItem } from '@brand/views/comps/JackPotItem';
import { JackpotPanelComp } from '@brand/views/comps/JackpotPanelComp';

export const JACKPOT_PANEL_CONFIG: any = {
  name: 'jackpotContainer',
  type: 'Comp',
  class: JackpotPanelComp,
  jackpotConfig: {
    noOfElement: 4,
    elemenContent: ['bronzeTitle', 'silverTitle', 'goldTitle', 'diamondTitle'],
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
          style: { fontFamily: 'gameFont1', fontSize: 25, fill: 0x64cdff, wordWrap: true, wordWrapWidth: 210 },
          content: '',
          anchor: { x: 0.5, y: 0.5 },
        },
      ],
    },
  },
  Elements: [],
  layoutData: {},
};
