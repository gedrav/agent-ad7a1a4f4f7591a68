import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { PixText } from '@core/pixiwrapper/PixText';
import { ResponsiveView } from '@core/pixiwrapper/ResponsiveView';
import { EventHandler } from '@core/pixiwrapper/EventHandlerService';
import { JCEvents } from '@slots/jokerCharge/events/JCEvents';
import { MIN_LINES, MAX_LINES, setSelectedLines } from '@slots/jokerCharge/models/JCLinesState';
import { setupButtonInteraction } from '@slots/jokerCharge/views/comps/buttonInteraction';

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

    setupButtonInteraction(this.buyBonusBtn, this.onBuyBonusClicked.bind(this));
    setupButtonInteraction(this.linesMinusBtn, this.onLinesMinusClicked.bind(this));
    setupButtonInteraction(this.linesPlusBtn, this.onLinesPlusClicked.bind(this));
    this.updateLinesText();
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
