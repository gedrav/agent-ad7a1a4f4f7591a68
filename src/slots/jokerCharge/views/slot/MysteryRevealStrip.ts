import { Container, Graphics } from 'pixi.js';
import { UIUtil } from '@core/utils/UIUtilService';
import { PixText } from '@core/pixiwrapper/PixText';

// TODO: placeholder sizing/timing - tune once the real mystery_back/mystery_front art is in.
const ROW_HEIGHT = 90;
const VISIBLE_ROWS = 2;
const START_TICK_MS = 60;
const MAX_TICK_MS = 260;
const DECELERATION_STEPS = 12;

export default class MysteryRevealStrip extends Container {
  private readonly rowsContainer: Container = new Container();
  private readonly rows: PixText[] = [];
  private readonly textStyle: any;
  private candidates: string[] = [];
  private tickHandle: number | null = null;
  private step: number = 0;
  private stopping: boolean = false;
  private finalLabel: string = '';
  private onSettled?: () => void;

  constructor(textStyle: any) {
    super();
    this.textStyle = textStyle;
    this.addChild(this.rowsContainer);
    this.applyMask();
    this.buildRows();
  }

  private applyMask(): void {
    const maskShape = new Graphics().rect(-100, -ROW_HEIGHT / 2, 200, ROW_HEIGHT * VISIBLE_ROWS).fill(0xffffff);
    this.addChild(maskShape);
    this.mask = maskShape;
  }

  private buildRows(): void {
    for (let i = 0; i < VISIBLE_ROWS; i++) {
      const row = UIUtil.getText({ name: `mysteryRow${i}`, contentText: '', style: { ...this.textStyle } });
      row.anchor.set(0.5, 0.5);
      row.y = i * ROW_HEIGHT;
      this.rows.push(row);
      this.rowsContainer.addChild(row);
    }
  }

  public startSpin(candidates: string[]): void {
    this.candidates = candidates;
    this.stopping = false;
    this.step = 0;
    this.rows.forEach((row) => (row.text = this.randomCandidate()));
    this.scheduleTick(START_TICK_MS);
  }

  // Signals the strip to decelerate and settle on finalLabel; onComplete fires once it has.
  public stopAt(finalLabel: string, onComplete?: () => void): void {
    this.finalLabel = finalLabel;
    this.onSettled = onComplete;
    this.stopping = true;
  }

  private scheduleTick(delay: number): void {
    this.clearTick();
    this.tickHandle = window.setTimeout(() => this.onTick(), delay);
  }

  private clearTick(): void {
    if (this.tickHandle != null) {
      window.clearTimeout(this.tickHandle);
      this.tickHandle = null;
    }
  }

  private onTick(): void {
    this.step++;
    const isFinalStep = this.stopping && this.step >= DECELERATION_STEPS;

    this.rows[0].text = isFinalStep ? this.finalLabel : this.randomCandidate();
    this.rows[1].text = this.randomCandidate();

    if (isFinalStep) {
      const onSettled = this.onSettled;
      this.onSettled = undefined;
      onSettled?.();
      return;
    }

    const delay = this.stopping
      ? START_TICK_MS + ((MAX_TICK_MS - START_TICK_MS) * this.step) / DECELERATION_STEPS
      : START_TICK_MS;
    this.scheduleTick(delay);
  }

  private randomCandidate(): string {
    return this.candidates[Math.floor(Math.random() * this.candidates.length)] ?? '';
  }

  public destroy(...args: any[]): void {
    this.clearTick();
    super.destroy(...args);
  }
}
