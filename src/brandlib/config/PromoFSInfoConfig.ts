import { PromoFSInfoComp } from '@core/views/comps/PromoFSInfoComp';

export const PROMOFS_INFO_CONFIG: any = {
  name: 'promoFSInfoComp',
  type: 'Comp',
  class: PromoFSInfoComp,
  Elements: [
    {
      name: 'bg',
      type: 'Graphics',
      width: 280,
      height: 90,
      color: 0x000000,
      alpha: 0.65,
    },
    {
      name: 'spinValueText',
      type: 'Text',
      content: '',
      anchor: { x: 0.5, y: 0.5 },
      x: 140,
      y: 28,
      style: { fontFamily: 'commonFont', fontSize: 32, fill: 0xffc600, fontWeight: 700 },
    },
    {
      name: 'winValueText',
      type: 'Text',
      content: '',
      anchor: { x: 0.5, y: 0.5 },
      x: 140,
      y: 62,
      style: { fontFamily: 'commonFont', fontSize: 22, fill: 0xffffff, fontWeight: 400 },
    },
  ],
  layoutData: {
    Desktop: {
      widthPerc: 0.16,
      heightPerc: 0.06,
      hAlign: 'right',
      vAlign: 'top',
      hPaddingPerc: 0.02,
      vPaddingPerc: 0.02,
      maxScale: 1,
    },
    Landscape: {
      widthPerc: 0.22,
      heightPerc: 0.07,
      hAlign: 'right',
      vAlign: 'top',
      hPaddingPerc: 0.02,
      vPaddingPerc: 0.02,
      maxScale: 1,
    },
    Portrait: {
      widthPerc: 0.4,
      heightPerc: 0.05,
      hAlign: 'right',
      vAlign: 'top',
      hPaddingPerc: 0.02,
      vPaddingPerc: 0.02,
      maxScale: 1,
    },
  },
};
