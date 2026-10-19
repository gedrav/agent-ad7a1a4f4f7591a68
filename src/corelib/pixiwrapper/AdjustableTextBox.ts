import { PixText } from '@core/pixiwrapper/PixText';

// Auto-shrinks its font size (never grows past the style's configured fontSize) so the
// rendered text never exceeds configData.maxWidth / configData.maxHeight, instead of
// overflowing or wrapping. Either bound may be omitted.
export class AdjustableTextBox extends PixText {
  private static readonly MIN_FONT_SIZE = 1;

  private maxWidth: number;
  private maxHeight: number;
  private readonly baseFontSize: number;

  constructor(textData: any, configData: any) {
    super(textData, configData);
    this.maxWidth = configData.maxWidth;
    this.maxHeight = configData.maxHeight;
    this.baseFontSize = this.style.fontSize;
    this.fitToBounds();
  }

  public override set text(value: any) {
    super.text = value;
    this.fitToBounds();
  }

  public override get text(): string {
    return super.text;
  }

  public constrainBounds(maxWidth: number, maxHeight: number): void {
    const width = AdjustableTextBox.clamp(this.maxWidth, maxWidth);
    const height = AdjustableTextBox.clamp(this.maxHeight, maxHeight);
    let changed = width !== this.maxWidth || height !== this.maxHeight;
    this.maxWidth = width;
    this.maxHeight = height;
    if (this.maxWidth && this.configData?.style?.wordWrapWidth == undefined) {
      this.style.wordWrapWidth = this.maxWidth;
      changed = true;
    }
    if (changed) {
      this.fitToBounds();
    }
  }

  private static clamp(configured: number, available: number): number {
    if (!available) {
      return configured;
    }
    return configured ? Math.min(configured, available) : available;
  }

  private setFontSize(size: number): void {
    // Forcing a text reassignment after a style change is the established pattern in this
    // codebase (see UIUtilService.updateFontSize) for getting PixiJS to re-measure immediately.
    const current = super.text;
    this.style.fontSize = size;
    super.text = 'BBB';
    super.text = current;
  }

  private withinBounds(): boolean {
    if (this.maxWidth && this.width > this.maxWidth) {
      return false;
    }
    return !(this.maxHeight && this.height > this.maxHeight);
  }

  private fitToBounds(): void {
    if (!this.maxWidth && !this.maxHeight) {
      return;
    }

    this.setFontSize(this.baseFontSize);
    if (this.withinBounds()) {
      return;
    }

    let fontSize = this.baseFontSize;
    if (this.maxWidth && this.width > this.maxWidth) {
      fontSize = Math.max(
        Math.floor(this.baseFontSize * (this.maxWidth / this.width)),
        AdjustableTextBox.MIN_FONT_SIZE,
      );
      this.setFontSize(fontSize);
    }

    while (!this.withinBounds() && fontSize > AdjustableTextBox.MIN_FONT_SIZE) {
      fontSize -= 1;
      this.setFontSize(fontSize);
    }
  }
}
