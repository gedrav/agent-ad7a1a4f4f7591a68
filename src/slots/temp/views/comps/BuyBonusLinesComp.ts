import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsiveChildrenView } from '@core/pixiwrapper/ResponsiveChildrenView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/temp/events/JCEvents';
import { MIN_LINES, MAX_LINES, getSelectedLines, setSelectedLines } from '@slots/temp/models/JCLinesState';
import { setupButtonInteraction } from '@slots/temp/views/comps/buttonInteraction';

// Buy Bonus button + Lines selector, positioned inside SlotMachineConfig.ts's Elements array.
// ResponsiveChildrenView, not ResponsiveView: the latter only adjusts the comp itself, so the
// per-orientation layoutData on bonusBtnGroup and linesGroup would never be read.
export class BuyBonusLinesComp extends ResponsiveChildrenView {
  private readonly linesMinusBtn: PixSprite;
  private readonly linesPlusBtn: PixSprite;
  private readonly linesValueText: PixText;
  // From the state, not MIN_LINES: a restored sticky session sets it before this is built.
  private currentLines: number = getSelectedLines();

  constructor(configData: any) {
    super(configData);
    const bonusBtnGroup = this.elementsList['bonusBtnGroup'];
    const linesGroup = this.elementsList['linesGroup'];
    this.linesMinusBtn = linesGroup.elementsList['linesMinusBtn'];
    this.linesPlusBtn = linesGroup.elementsList['linesPlusBtn'];
    this.linesValueText = linesGroup.elementsList['linesValueText'];

    // The group, not the plate: the cart and the label sit on top of the plate, so hooking the
    // plate alone lets them swallow a click and leaves them behind when the button scales.
    setupButtonInteraction(bonusBtnGroup, this.onBuyBonusClicked.bind(this));
    setupButtonInteraction(this.linesMinusBtn, this.onLinesMinusClicked.bind(this));
    setupButtonInteraction(this.linesPlusBtn, this.onLinesPlusClicked.bind(this));
    // Also listened to, not just dispatched: a restored sticky session sets the count before any
    // of this exists, and the announcement that follows is what this catches up on.
    EventHandler.addEventListener(JCEvents.SELECTED_LINES, this.onSelectedLines.bind(this));
    this.updateLinesText();
  }

  // From the state rather than the payload, and no re-dispatch: this is the same event this comp
  // sends when the player uses the buttons.
  private onSelectedLines(): void {
    this.currentLines = getSelectedLines();
    this.updateLinesText();
  }

  private onBuyBonusClicked(): void {
    EventHandler.dispatchEvent(JCEvents.SHOW_BUY_BONUS_SCREEN);
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
