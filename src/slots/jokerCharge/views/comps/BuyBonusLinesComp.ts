import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { AnimationProxy } from '@core/models/AnimationServiceProxy';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { MIN_LINES, MAX_LINES, setSelectedLines } from '@slots/jokerCharge/models/JCLinesState';

const TINT_REST = 0xe0e0e0;
const TINT_HOVER = 0xffffff;
const TINT_PRESS = 0x999999;
const PRESS_SCALE = 0.92;
const TWEEN_DURATION = 0.12;

// Buy Bonus button + Lines selector, positioned inside SlotMachineConfig.ts's Elements array.
export class BuyBonusLinesComp extends ResponsiveView {
  private readonly buyBonusBtn: PixSprite;
  private readonly linesMinusBtn: PixSprite;
  private readonly linesPlusBtn: PixSprite;
  private readonly linesValueText: PixText;
  private currentLines: number = MIN_LINES;

  constructor(configData: any) {
    super(configData);
    const bonusBtnGroup = this.elementsList['bonusBtnGroup'];
    const linesGroup = this.elementsList['linesGroup'];
    this.buyBonusBtn = bonusBtnGroup.elementsList['buyBonusBtn'];
    this.linesMinusBtn = linesGroup.elementsList['linesMinusBtn'];
    this.linesPlusBtn = linesGroup.elementsList['linesPlusBtn'];
    this.linesValueText = linesGroup.elementsList['linesValueText'];

    this.setupButton(this.buyBonusBtn, this.onBuyBonusClicked.bind(this));
    this.setupButton(this.linesMinusBtn, this.onLinesMinusClicked.bind(this));
    this.setupButton(this.linesPlusBtn, this.onLinesPlusClicked.bind(this));
    this.updateLinesText();
  }

  // Uses PixiJS's unified pointer events directly rather than UIUtil's addHoverInteraction/
  // addDownInteraction/etc. - those bind 'touchstart' for both hover and press (and 'touchend'
  // for both up and click), so on any touch-capable input both fire together off one tap and
  // their tweens fight over the same tint/scale. Pointer events fire once regardless of input type.
  private setupButton(btn: PixSprite, onClick: () => void): void {
    btn.tint = TINT_REST;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    const release = () => {
      AnimationProxy.animateTween(btn, { duration: TWEEN_DURATION, tint: TINT_HOVER, scaleX: 1, scaleY: 1 });
    };
    btn.on('pointerover', () => {
      AnimationProxy.animateTween(btn, { duration: TWEEN_DURATION, tint: TINT_HOVER });
    });
    btn.on('pointerout', () => {
      AnimationProxy.animateTween(btn, { duration: TWEEN_DURATION, tint: TINT_REST, scaleX: 1, scaleY: 1 });
    });
    btn.on('pointerdown', () => {
      AnimationProxy.animateTween(btn, {
        duration: TWEEN_DURATION * 0.7,
        tint: TINT_PRESS,
        scaleX: PRESS_SCALE,
        scaleY: PRESS_SCALE,
      });
    });
    btn.on('pointerup', release);
    btn.on('pointerupoutside', release);
    btn.on('pointertap', onClick);
  }

  // TODO: replace with the real Buy Bonus flow once it's ready.
  private onBuyBonusClicked(): void {
    alert('Buy Bonus clicked');
  }

  private onLinesMinusClicked(): void {
    this.currentLines = this.currentLines <= MIN_LINES ? MAX_LINES : this.currentLines - 1;
    this.updateLinesText();
    setSelectedLines(this.currentLines);
    EventHandler.dispatchEvent(JCEvents.SELECTED_LINES, this.currentLines);
  }

  private onLinesPlusClicked(): void {
    this.currentLines = this.currentLines >= MAX_LINES ? MIN_LINES : this.currentLines + 1;
    this.updateLinesText();
    setSelectedLines(this.currentLines);
    EventHandler.dispatchEvent(JCEvents.SELECTED_LINES, this.currentLines);
  }

  private updateLinesText(): void {
    this.linesValueText.text = String(this.currentLines);
  }
}
