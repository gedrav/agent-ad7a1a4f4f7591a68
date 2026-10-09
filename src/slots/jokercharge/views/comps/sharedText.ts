import { Text, TextStyle } from 'pixi.js';

// Every change to a Text redraws its canvas and uploads it again, which for the gradient, stroke and
// shadow styles here is the costliest thing a frame can do. A count-up only has to read as counting,
// so it writes at most this often. The last figure always lands - see final.
const COUNT_WRITE_INTERVAL_MS = 50;
const lastCountWrite = new WeakMap<Text, number>();

export function writeCountText(text: Text, value: string, final = false): void {
  if (text.text === value) return;
  const now = performance.now();
  if (!final && now - (lastCountWrite.get(text) ?? -Infinity) < COUNT_WRITE_INTERVAL_MS) return;
  lastCountWrite.set(text, now);
  text.text = value;
}

// UIUtil.getText() builds fresh gradients for every Text, and a gradient's key carries its own id, so
// two Texts in one style never share a texture. Handing them all the first one's TextStyle does: the
// same figure in the same style is then drawn once, however many cells show it.
const SHARED_STYLES = new Map<any, TextStyle>();

export function shareTextStyle(text: Text, styleConfig: any): void {
  const shared = SHARED_STYLES.get(styleConfig);
  if (!shared) {
    SHARED_STYLES.set(styleConfig, text.style);
    return;
  }
  text.style = shared;
}

// A Text subscribes to its style's updates and destroy() never unsubscribes, so on a shared style
// every dead Text would stay on its list.
export function releaseSharedStyle(text: Text): void {
  text.style?.off('update', (text as any).onViewUpdate, text);
}
