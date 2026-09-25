import { BlurFilter, Container, Ticker } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { PixText } from '@core/pixiwrapper/PixText';
import { UIUtil } from '@core/utils/UIUtilService';
import { Util } from '@core/utils/UtilService';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { appModel } from '@core/models/services/AppModelService';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JACKPOT_TEXT_STYLES, MULTIPLIER_TEXT_STYLE } from '../../config/SymbolsConfig';
import { JCEvents } from '../../events/JCEvents';
import { ROOT_TEXT_SLOT_NAME } from './JCBonusSymbolModifier';

const FRONT_SPINE_NAME = 'mystery_front';

// What the backend says this symbol turned out to be. amount is the cor multiplier of a value
// result, multiplied by the bet at display time - never worked out here.
export interface MysteryReelResult {
  type: 'value' | 'mini' | 'minor' | 'major';
  amount?: number;
}

export const MYSTERY_REEL_CONFIG = {
  // The symbol's inner window, in the rig's own units - the strip is masked to this.
  window: { width: 1200, height: 900 },
  // How much of the strip the window shows: the centre cell plus a slice above and below.
  visibleCells: 2.5,
  cellPool: 5,
  spinUpMs: 150,
  fullSpeedMs: 750,
  stopMs: 500,
  staggerMs: 120,
  popMs: 200,
  popScale: 1.15,
  // back.out strength on the stop, which is what carries the result past the centre line and
  // back again - 1.7 lands about a tenth of a cell past it.
  stopOvershoot: 1.7,
  // Top speed, in cells per second.
  cellsPerSecond: 1,
  // Whole strip lengths travelled during the stop, on top of the distance to the landing cell.
  stopLoops: 1,
  // A cell at the window's edge against one on the centre line.
  edgeScaleY: 0.6,
  edgeAlpha: 1,
  blurMax: 0,
  // Share of the strip that is a jackpot label rather than a cash value.
  jackpotChance: 0.3,
  valueMultipliers: [1, 2, 3, 4, 5],
  // Override whatever size the borrowed styles carry - they're sized for a symbol's own label.
  // Values get their own, larger size: they're short, where a jackpot label has to fit MINOR.
  valueFontSize: 400,
  jackpotFontSize: 320,
};

interface ReelItem {
  text: string;
  // Already resolved into a TextStyle - see resolveTextStyle().
  style: any;
}

// UIUtil.getText() deep-clones its config through JSON and turns array fills into FillGradient
// objects, which own textures. Handing one of the shared style configs straight to a Text leaves
// those gradients on the config itself, and the next clone of it then chokes on the texture. So
// each config is resolved once, through UIUtil, into a real TextStyle that cells can share.
const RESOLVED_STYLES = new Map<any, Map<number, any>>();

function resolveTextStyle(config: any, fontSize: number): any {
  let bySize = RESOLVED_STYLES.get(config);
  if (!bySize) {
    bySize = new Map<number, any>();
    RESOLVED_STYLES.set(config, bySize);
  }
  const cached = bySize.get(fontSize);
  if (cached) return cached;

  const probe: PixText = UIUtil.getElement({
    name: 'mysteryStyleProbe',
    type: 'Text',
    contentText: '',
    style: { ...config, fontSize },
  });
  const style = probe.style;
  // The style outlives the text it was built with - destroy() leaves it alone unless asked.
  probe.destroy();
  bySize.set(fontSize, style);
  return style;
}

type ReelPhase = 'idle' | 'spinUp' | 'fullSpeed';

// mystery / mystery jackpot render as two spines: ReelSymbolSpine creates the "mystery_back"
// layer, this adds "mystery_front" on top. Not pooled via SpinePool - that pool keys by symbol
// name, and mixing back/front spines under the same name would hand out the wrong skeleton on reuse.
//
// It also owns the mini reel that spins inside the symbol's window when the result is revealed,
// see spinReel().
export class JCMysterySymbolModifier {
  private frontSpine: PixSpine | null = null;

  private reelContainer: Container | null = null;
  private reelMask: PixGraphics | null = null;
  private blurFilter: BlurFilter | null = null;
  private resultLabel: PixText | null = null;
  private cells: PixText[] = [];
  private cellY: number[] = [];
  private cellItems: ReelItem[] = [];
  private lastItem: ReelItem | null = null;

  private phase: ReelPhase = 'idle';
  private phaseElapsed = 0;
  private speed = 0;
  private landerIndex = -1;
  private landerWrapsLeft = 0;
  private result: MysteryReelResult | null = null;
  private bet = 0;
  private startTimeoutId: any = null;
  // The stop tween runs on this, not on a display object, so teardown has to kill it by hand.
  private stopTarget: { value: number } | null = null;
  // Spins on until something lands it, rather than running its own full-speed clock.
  private endless = false;
  private onLanded: (() => void) | null = null;

  constructor(private readonly host: Container) {}

  public create(animScale?: number): void {
    this.destroy();
    this.frontSpine = UIUtil.getSpineAnim(FRONT_SPINE_NAME, { spineName: FRONT_SPINE_NAME });
    this.frontSpine.label = 'mysteryFront';
    this.frontSpine.stopAnimation();
    if (animScale) {
      this.frontSpine.scale.set(animScale);
    }
    this.host.addChild(this.frontSpine);
    this.setVisible(false);
  }

  public play(state: string, loop: boolean, skin?: string): void {
    if (!this.frontSpine) return;
    if (skin) {
      this.frontSpine.setSkin(skin);
    }
    this.frontSpine.playAnimation({ state, loop });
  }

  public setVisible(flag: boolean): void {
    if (this.frontSpine) {
      this.frontSpine.visible = flag;
    }
  }

  // Spins the strip inside the symbol's window and settles on the backend's result. Resolves once
  // the landing pop has finished. In turbo the strip is skipped and only the pop plays.
  public spinReel(result: MysteryReelResult, bet: number, delayMs = 0): Promise<void> {
    this.bet = bet;
    // Already turning, from the feature starting - just bring it down on the result.
    if (this.isSpinning) return this.landOn(result);

    this.stopReel();
    this.result = result;
    this.endless = false;

    return new Promise((resolve) => {
      this.onLanded = resolve;
      if (appModel.turboMode) {
        this.snapToResult();
        return;
      }
      this.startTimeoutId = setTimeout(() => this.startReel(), delayMs);
    });
  }

  // Starts the strip with no result yet: it keeps turning until landOn() gives it one.
  public startSpin(bet: number, delayMs = 0): void {
    if (this.isSpinning) return;
    this.stopReel();
    this.bet = bet;
    this.result = null;
    this.endless = true;
    this.startTimeoutId = setTimeout(() => this.startReel(), delayMs);
  }

  public landOn(result: MysteryReelResult): Promise<void> {
    this.result = result;
    this.endless = false;

    return new Promise((resolve) => {
      this.onLanded = resolve;
      if (appModel.turboMode || !this.reelContainer) {
        this.snapToResult();
        return;
      }
      this.beginStop();
    });
  }

  public get isSpinning(): boolean {
    return !!this.reelContainer || !!this.startTimeoutId;
  }

  public stopReel(): void {
    clearTimeout(this.startTimeoutId);
    this.startTimeoutId = null;
    Ticker.shared.remove(this.onTick, this);
    this.phase = 'idle';
    this.endless = false;
    this.tearDownReel();
    // Whoever was waiting on this spin is released rather than left holding a promise that can
    // never settle, and the closure it kept alive goes with it.
    const onLanded = this.onLanded;
    this.onLanded = null;
    onLanded?.();
    if (this.resultLabel) {
      this.host.removeChild(this.resultLabel);
      this.resultLabel.destroy();
      this.resultLabel = null;
    }
  }

  private get cellHeight(): number {
    return MYSTERY_REEL_CONFIG.window.height / MYSTERY_REEL_CONFIG.visibleCells;
  }

  private get stripHeight(): number {
    return this.cellHeight * MYSTERY_REEL_CONFIG.cellPool;
  }

  private get maxSpeed(): number {
    return this.cellHeight * MYSTERY_REEL_CONFIG.cellsPerSecond;
  }

  private buildReel(): void {
    this.clearSymbolLabel();
    const container = new Container();
    container.label = 'mysteryReel';
    this.reelContainer = container;

    this.reelMask = UIUtil.getRectangle(
      MYSTERY_REEL_CONFIG.window.width,
      MYSTERY_REEL_CONFIG.window.height,
      0xff0000,
      -MYSTERY_REEL_CONFIG.window.width / 2,
      -MYSTERY_REEL_CONFIG.window.height / 2,
    );
    this.reelMask.label = 'mysteryReelMask';
    this.reelMask.alpha = 0;
    container.addChild(this.reelMask);
    container.mask = this.reelMask;

    for (let i = 0; i < MYSTERY_REEL_CONFIG.cellPool; i++) {
      const cell = new PixText(
        { text: '', style: resolveTextStyle(MULTIPLIER_TEXT_STYLE, MYSTERY_REEL_CONFIG.valueFontSize) },
        {},
      );
      cell.anchor.set(0.5, 0.5);
      cell.label = 'mysteryReelCell';
      this.cells[i] = cell;
      this.cellY[i] = (i - (MYSTERY_REEL_CONFIG.cellPool - 1) / 2) * this.cellHeight;
      this.assignItem(i, this.pickItem());
      container.addChild(cell);
    }

    this.host.addChild(container);
    this.raiseFrontSpine();
    this.layout();
  }

  // The symbol's own MYSTERY label sits on the rig's text slot, right where the strip is about to
  // run. Cast because the modifier is handed a plain Container, but only ever a spine symbol.
  private clearSymbolLabel(): void {
    (this.host as any).removeSlotObject?.(ROOT_TEXT_SLOT_NAME);
  }

  // The glass belongs over the strip, and both were added after the symbol's own rig.
  private raiseFrontSpine(): void {
    if (!this.frontSpine) return;
    this.host.setChildIndex(this.frontSpine, this.host.children.length - 1);
  }

  // Weighted toward cash values, and never the same item twice in a row.
  private pickItem(): ReelItem {
    for (let attempt = 0; attempt < 8; attempt++) {
      const item =
        Math.random() < MYSTERY_REEL_CONFIG.jackpotChance ? this.randomJackpotItem() : this.randomValueItem();
      if (item.text !== this.lastItem?.text) return item;
    }
    return this.randomValueItem();
  }

  private randomValueItem(): ReelItem {
    const multipliers = MYSTERY_REEL_CONFIG.valueMultipliers;
    return this.valueItem(multipliers[Util.getRandomRange(0, multipliers.length - 1)]);
  }

  private valueItem(multiplier: number): ReelItem {
    return {
      text: Util.formatCurrencyNoSymbol(multiplier * this.bet),
      style: resolveTextStyle(MULTIPLIER_TEXT_STYLE, MYSTERY_REEL_CONFIG.valueFontSize),
    };
  }

  private randomJackpotItem(): ReelItem {
    const names = Object.keys(JACKPOT_TEXT_STYLES);
    return this.jackpotItem(names[Util.getRandomRange(0, names.length - 1)]);
  }

  private jackpotItem(name: string): ReelItem {
    return {
      text: name.toUpperCase(),
      style: resolveTextStyle(JACKPOT_TEXT_STYLES[name], MYSTERY_REEL_CONFIG.jackpotFontSize),
    };
  }

  private resultItem(): ReelItem {
    const result = this.result;
    if (!result || result.type === 'value') return this.valueItem(result?.amount ?? 1);
    return this.jackpotItem(result.type);
  }

  private assignItem(index: number, item: ReelItem): void {
    const cell = this.cells[index];
    cell.style = item.style;
    cell.text = item.text;
    this.cellItems[index] = item;
    this.lastItem = item;
  }

  private startReel(): void {
    this.buildReel();
    this.phase = 'spinUp';
    this.phaseElapsed = 0;
    this.speed = 0;
    Ticker.shared.add(this.onTick, this);
  }

  private onTick(ticker: Ticker): void {
    const dt = ticker.deltaMS / 1000;
    this.phaseElapsed += ticker.deltaMS;

    if (this.phase === 'spinUp') {
      const progress = Math.min(this.phaseElapsed / MYSTERY_REEL_CONFIG.spinUpMs, 1);
      // Eased in, so it builds rather than jumping to speed.
      this.speed = this.maxSpeed * progress * progress;
      if (progress >= 1) {
        this.phase = 'fullSpeed';
        this.phaseElapsed = 0;
      }
    } else {
      this.speed = this.maxSpeed;
      if (!this.endless && this.phaseElapsed >= MYSTERY_REEL_CONFIG.fullSpeedMs) {
        this.beginStop();
        return;
      }
    }

    this.advance(this.speed * dt);
  }

  private advance(distance: number): void {
    for (let i = 0; i < this.cells.length; i++) {
      this.cellY[i] += distance;
      // The strip moves down, so a cell leaving the bottom comes back in at the top carrying the
      // next item.
      while (this.cellY[i] > this.stripHeight / 2) {
        this.cellY[i] -= this.stripHeight;
        this.onCellWrapped(i);
      }
    }
    this.layout();
  }

  private onCellWrapped(index: number): void {
    if (index === this.landerIndex) {
      this.landerWrapsLeft--;
      if (this.landerWrapsLeft <= 0) {
        this.assignItem(index, this.resultItem());
        return;
      }
    }
    this.assignItem(index, this.pickItem());
  }

  // Fakes a cylinder: cells squash and fade with their distance from the centre line.
  private layout(): void {
    const halfWindow = MYSTERY_REEL_CONFIG.window.height / 2;
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      const distance = Math.min(Math.abs(this.cellY[i]) / halfWindow, 1);
      cell.y = this.cellY[i];
      cell.scale.set(1, 1 - (1 - MYSTERY_REEL_CONFIG.edgeScaleY) * distance);
      cell.alpha = 1 - (1 - MYSTERY_REEL_CONFIG.edgeAlpha) * distance;
    }
    this.applyBlur(this.speed / this.maxSpeed);
  }

  private applyBlur(ratio: number): void {
    if (!this.reelContainer) return;
    const strength = MYSTERY_REEL_CONFIG.blurMax * Math.max(ratio, 0);
    if (strength < 0.5) {
      this.reelContainer.filters = [];
      return;
    }
    if (!this.blurFilter) {
      this.blurFilter = new BlurFilter({ strength: 0, quality: 2 });
    }
    this.blurFilter.strengthX = 0;
    this.blurFilter.strengthY = strength;
    this.reelContainer.filters = [this.blurFilter];
  }

  // The bottommost cell is the one that comes back round onto the centre line, so it carries the
  // result on its last wrap and the distance is picked to leave it exactly there.
  private beginStop(): void {
    Ticker.shared.remove(this.onTick, this);
    this.phase = 'idle';

    let lowest = 0;
    for (let i = 1; i < this.cells.length; i++) {
      if (this.cellY[i] > this.cellY[lowest]) lowest = i;
    }
    this.landerIndex = lowest;
    this.landerWrapsLeft = 1 + MYSTERY_REEL_CONFIG.stopLoops;

    const distance = this.stripHeight - this.cellY[lowest] + MYSTERY_REEL_CONFIG.stopLoops * this.stripHeight;
    const travel = { value: 0 };
    let travelled = 0;
    this.stopTarget = travel;

    AnimationProxy.animateTween(travel, {
      duration: MYSTERY_REEL_CONFIG.stopMs / 1000,
      value: distance,
      ease: 'back.out(' + MYSTERY_REEL_CONFIG.stopOvershoot + ')',
      onUpdate: () => {
        // Torn down mid-stop, so there is nothing left to move.
        if (!this.reelContainer) return;
        const step = travel.value - travelled;
        travelled = travel.value;
        // Taken from the tween's own pace, so the blur fades out as it slows.
        this.speed = Math.abs(step) * 60;
        this.advance(step);
      },
      onComplete: () => {
        this.stopTarget = null;
        if (!this.reelContainer) return;
        this.playLandingPop();
      },
    });
  }

  private playLandingPop(): void {
    this.speed = 0;
    this.applyBlur(0);
    const cell = this.cells[this.landerIndex];
    if (!cell) {
      this.finishLanding();
      return;
    }
    AnimationProxy.animateTween(cell.scale, {
      duration: MYSTERY_REEL_CONFIG.popMs / 2000,
      x: MYSTERY_REEL_CONFIG.popScale,
      y: MYSTERY_REEL_CONFIG.popScale,
      onComplete: () => {
        AnimationProxy.animateTween(cell.scale, {
          duration: MYSTERY_REEL_CONFIG.popMs / 2000,
          x: 1,
          y: 1,
          onComplete: () => this.finishLanding(),
        });
      },
    });
  }

  // Turbo, or a skip: the result is simply there, with the pop it would have landed on.
  private snapToResult(): void {
    this.tearDownReel();
    this.buildReel();
    this.landerIndex = 0;
    for (let i = 0; i < this.cellY.length; i++) {
      this.cellY[i] = i === 0 ? 0 : this.stripHeight;
    }
    this.assignItem(0, this.resultItem());
    this.speed = 0;
    this.layout();
    this.playLandingPop();
  }

  private finishLanding(): void {
    const item = this.cellItems[this.landerIndex] ?? this.resultItem();
    this.tearDownReel();
    this.showStaticResult(item);
    EventHandler.dispatchEvent(JCEvents.MYSTERY_REEL_LANDED, this.result);
    const onLanded = this.onLanded;
    this.onLanded = null;
    onLanded?.();
  }

  private showStaticResult(item: ReelItem): void {
    const label = new PixText({ text: item.text, style: item.style }, {});
    label.anchor.set(0.5, 0.5);
    label.label = 'mysteryResult';
    this.resultLabel = label;
    this.host.addChild(label);
    this.raiseFrontSpine();
  }

  private tearDownReel(): void {
    if (this.stopTarget) {
      AnimationProxy.killTweensOf(this.stopTarget);
      this.stopTarget = null;
    }
    this.cells.forEach((cell) => {
      AnimationProxy.killTweensOf(cell);
      AnimationProxy.killTweensOf(cell.scale);
    });
    this.cells = [];
    this.cellY = [];
    this.cellItems = [];
    this.lastItem = null;
    this.landerIndex = -1;
    if (this.reelContainer) {
      this.reelContainer.filters = [];
      this.reelContainer.mask = null;
      this.host.removeChild(this.reelContainer);
      this.reelContainer.destroy({ children: true });
      this.reelContainer = null;
    }
    this.reelMask = null;
    if (this.blurFilter) {
      this.blurFilter.destroy();
      this.blurFilter = null;
    }
  }

  public destroy(): void {
    this.stopReel();
    if (!this.frontSpine) return;
    this.frontSpine.stopAnimation();
    this.frontSpine.removeEventListners();
    this.frontSpine.destroySpine();
    this.frontSpine = null;
  }
}
