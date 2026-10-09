import { ReelTickerComp } from '@brand/views/comps/ReelTickerComp';
import { FSAutoCounterComp } from '@brand/views/comps/FSAutoCounterComp';

// The text area ReelTickerComp centres its messages in and masks them to. The comp's origin is its
// top-left corner, so the plate is centred on it rather than on the origin.
const TEXT_WIDTH = 1200;
const TEXT_HEIGHT = 100;
// reelTicker is 884 wide at full scale: x brings it to the reel frame's width (about 1415).
const PLATE_SCALE = { x: 1.6, y: 0.8 };

const TEXT_STYLE = {
  fontFamily: 'gameFont1',
  fontSize: 52,
  mFontSize: 60,
  fill: [0xfff4c4, 0xffc93d],
  fillGradientStops: [0, 1],
  stroke: { color: 0x3a1a00, width: 6 },
};

// Spins on the left, winnings on the right, the strip's own two ends.
const COUNTER_STYLE = { ...TEXT_STYLE, fontSize: 40, mFontSize: 48 };
const COUNTER_INSET = 30;

function tickerText(name: string): any {
  return { name, type: 'Text', anchor: { x: 0.5, y: 0.5 }, style: TEXT_STYLE };
}

// Each comp carries its own: the ticker hides itself whole during autoplay, plate and all, and
// that is when the counter shows.
function plate(): any {
  return {
    name: 'plate',
    type: 'Sprite',
    image: 'reelTicker',
    anchor: { x: 0.5, y: 0.5 },
    x: TEXT_WIDTH / 2,
    y: TEXT_HEIGHT / 2,
    scale: PLATE_SCALE,
  };
}

// Below the reels, centred on the grid (x 706). Portrait already has the buy/lines row right under
// the reels, so there it goes below that row instead. TODO: confirm both against the layout on
// screen.
const POSITION = {
  x: 706 - TEXT_WIDTH / 2,
  y: 960,
  layoutData: {
    Desktop: { x: 706 - TEXT_WIDTH / 2, y: 960 },
    Portrait: { x: 706 - TEXT_WIDTH / 2, y: 950 },
    Landscape: { x: 706 - TEXT_WIDTH / 2, y: 960 },
  },
};

export const TICKER_COMP_CONFIG: any = {
  name: 'tickerComp',
  type: 'Comp',
  class: ReelTickerComp,
  tickerDelay: 4000,
  content: ['Ticker1', 'Ticker2', 'Ticker3', 'Ticker4', 'Ticker5', 'Ticker6'],
  contentYPadding: 0,
  ...POSITION,
  Elements: [
    plate(),
    { name: 'bg', type: 'Graphics', width: TEXT_WIDTH, height: TEXT_HEIGHT, alpha: 0 },
    {
      name: 'textCont',
      type: 'Container',
      Elements: [tickerText('tickerText1'), tickerText('tickerText2')],
    },
    { name: 'maskRect', type: 'Graphics', color: 0xff0000, width: TEXT_WIDTH, height: TEXT_HEIGHT, x: 0, y: 0 },
  ],
};

// Takes the ticker's place on the same strip while autoplay (or promo spins) runs: the ticker
// hides itself then, and this shows - see FSAutoCounterComp.
export const FS_AUTO_COUNTER_CONFIG: any = {
  name: 'fsAutoCounterComp',
  type: 'Comp',
  class: FSAutoCounterComp,
  ...POSITION,
  Elements: [
    plate(),
    {
      name: 'spinsText',
      type: 'Text',
      anchor: { x: 0, y: 0.5 },
      x: -54,
      y: TEXT_HEIGHT / 2,
      style: COUNTER_STYLE,
    },
    {
      name: 'winningsText',
      type: 'Text',
      anchor: { x: 1, y: 0.5 },
      x: TEXT_WIDTH + COUNTER_INSET,
      y: TEXT_HEIGHT / 2,
      style: COUNTER_STYLE,
    },
  ],
};
