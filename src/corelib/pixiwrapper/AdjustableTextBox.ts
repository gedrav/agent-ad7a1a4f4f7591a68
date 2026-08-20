import { PixText } from '@core/pixiwrapper/PixText';

// Auto-shrinks its font size (never grows past the style's configured fontSize) so the
// rendered text never exceeds configData.maxWidth, instead of overflowing or wrapping.
export class AdjustableTextBox extends PixText {
  private static readonly MIN_FONT_SIZE = 1;

  private readonly maxWidth: number;
  private readonly baseFontSize: number;

  constructor(textData: any, configData: any) {
    super(textData, configData);
    this.maxWidth = configData.maxWidth;
    this.baseFontSize = this.style.fontSize;
    this.fitToMaxWidth();
  }

  public override set text(value: any) {
    super.text = value;
    this.fitToMaxWidth();
  }

  public override get text(): string {
    return super.text;
  }

  private setFontSize(size: number): void {
    // Forcing a text reassignment after a style change is the established pattern in this
    // codebase (see UIUtilService.updateFontSize) for getting PixiJS to re-measure immediately.
    const current = super.text;
    this.style.fontSize = size;
    super.text = 'BBB';
    super.text = current;
  }

  private fitToMaxWidth(): void {
    if (!this.maxWidth) {
      return;
    }

    this.setFontSize(this.baseFontSize);
    if (this.width <= this.maxWidth) {
      return;
    }

    let fontSize = Math.max(
      Math.floor(this.baseFontSize * (this.maxWidth / this.width)),
      AdjustableTextBox.MIN_FONT_SIZE,
    );
    this.setFontSize(fontSize);

    while (this.width > this.maxWidth && fontSize > AdjustableTextBox.MIN_FONT_SIZE) {
      fontSize -= 1;
      this.setFontSize(fontSize);
    }
  }
}
