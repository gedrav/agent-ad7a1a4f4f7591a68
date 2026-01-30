import { WinTicker } from '@core/views/comps/WinTicker';
import { FSInfoComp } from '@brand/views/comps/FSInfoComp';
import { TitleValueComp } from '@core/views/comps/TitleValueComp';
import { FSCountComp } from '@brand/views/comps/FSCountComp';

export const FREESPIN_INFO_COMP_CONFIG: any = {
  name: 'fsInfoComp',
  type: 'Comp',
  class: FSInfoComp,
  y: 1450,
  Elements: [
    {
      name: 'bg',
      type: 'Sprite',
      image: 'fsinfobg',
      layoutData: {},
    },
    {
      name: 'fsWinComp',
      type: 'Comp',
      anchor: { x: 0.5, y: 0 },
      class: WinTicker,
      Elements: [
        {
          name: 'titleText',
          type: 'Text',
          content: 'totalFSWinText',
          anchor: { x: 0.5, y: 0 },
          x: 0,
          style: { fontFamily: 'gameFont1', fontSize: 36, fill: 0xffd200 },
        },
        {
          name: 'valueText',
          type: 'Text',
          contentText: '0',
          anchor: { x: 0.5, y: 0 },
          x: 0,
          y: 50,
          style: { fontFamily: 'gameFont1', fontSize: 40, fill: 0xffffff },
        },
      ],
      layoutData: {
        Desktop: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.22 },
        Portrait: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.22 },
        Landscape: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle', vPaddingPerc: -0.22 },
      },
    },
    {
      name: 'fsCountComp',
      type: 'Comp',
      anchor: { x: 0.5, y: 0 },
      class: FSCountComp,
      x: 0,
      Elements: [
        {
          name: 'fsCountTitle',
          type: 'Text',
          content: 'freespinCountTitle',
          anchor: { x: 0.5, y: 0 },
          x: 0,
          style: { fontFamily: 'gameFont1', fontSize: 36, fill: 0xffd200 },
        },
        {
          name: 'valueText',
          type: 'Text',
          contentText: '0',
          anchor: { x: 0.5, y: 0 },
          x: 0,
          y: 50,
          style: { fontFamily: 'gameFont1', fontSize: 40, fill: 0xffffff },
        },
      ],
      layoutData: {
        Desktop: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.22 },
        Portrait: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.22 },
        Landscape: { refComponent: 'bg', hAlign: 'center', vAlign: 'middle', vPaddingPerc: 0.22 },
      },
    },
  ],
  layoutData: {
    Desktop: { hAlign: 'right', vAlign: 'middle', widthPerc: 0.12, heightPerc: 0.2, hPaddingPerc: -0.01 },
    DesktopPortrait: { hAlign: 'center', vAlign: 'bottom', widthPerc: 0.2, heightPerc: 0.14, vPaddingPerc: -0.06 },
    Portrait: { hAlign: 'center', vAlign: 'bottom', widthPerc: 0.44, heightPerc: 0.2, vPaddingPerc: -0.08 },
    Landscape: { hAlign: 'right', vAlign: 'middle', widthPerc: 0.18, heightPerc: 0.32, hPaddingPerc: -0.01 },
  },
};
