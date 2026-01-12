import { TimerView } from '@core/views/containers/TimerView';
export const TIMER_CONFIG = {
  name: 'timerView',
  type: 'Comp',
  class: TimerView,
  Elements: [
    { name: 'bg', type: 'RoundedRectangle', width: 240, height: 60, color: 0x000000, alpha: 0.9, radius: 20 },
    {
      name: 'clockTxt',
      type: 'Text',
      style: { fontFamily: 'commonFont', fontSize: 30, fill: 0xffffff },
      anchor: { x: 0.5, y: 0.5 },
      x: 120,
      y: 30,
    },
  ],
  layoutData: {
    Desktop: {
      hAlign: 'right',
      vAlign: 'top',
      widthPerc: 0.2,
      heightPerc: 0.2,
      vPaddingPerc: 0.005,
      hPaddingPerc: -0.005,
      maxScale: 1,
    },
    Portrait: {
      hAlign: 'right',
      vAlign: 'top',
      widthPerc: 0.22,
      heightPerc: 0.4,
      vPaddingPerc: 0.005,
      hPaddingPerc: -0.01,
      maxScale: 1.2,
    },
    Landscape: {
      hAlign: 'right',
      vAlign: 'top',
      widthPerc: 0.2,
      heightPerc: 0.06,
      vPaddingPerc: 0.005,
      hPaddingPerc: -0.005,
      maxScale: 1,
    },
  },
};
