import { PromoFSInfoComp } from '@core/views/comps/PromoFSInfoComp';

export const PROMOFS_INFO_CONFIG: any = {
  name: 'promoFSInfoComp',
  type: 'Comp',
  class: PromoFSInfoComp,
  x: 42,
  y: 1070,
  Elements: [
    {
      name: 'spinValueText',
      type: 'Text',
      content: '',
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 40, fill: 0xffc600, fontWeight: 700 },
    },
    {
      name: 'winValueText',
      type: 'Text',
      content: '',
      anchor: { x: 0.5, y: 0.5 },
      style: { fontFamily: 'commonFont', fontSize: 28, fill: 0xffffff, fontWeight: 400 },
    },
  ],
};
