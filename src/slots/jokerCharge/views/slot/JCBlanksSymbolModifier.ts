import { Container } from 'pixi.js';
import { PixGraphics } from '@core/pixiwrapper/PixGraphics';
import { UIUtil } from '@core/utils/UIUtilService';

const BLANKS_WIDTH = 450;
const BLANKS_HEIGHT = 290;
const BLANKS_COLOR = 0x800080;

// Placeholder for the "Blanks" symbol until real art is ready - same box across every state.
export class JCBlanksSymbolModifier {
  private graphic: PixGraphics | null = null;

  constructor(private readonly host: Container) {}

  public create(): void {
    if (this.graphic) return;
    this.graphic = UIUtil.getRectangle(
      BLANKS_WIDTH,
      BLANKS_HEIGHT,
      BLANKS_COLOR,
      -BLANKS_WIDTH / 2,
      -BLANKS_HEIGHT / 2,
    );
    this.host.addChild(this.graphic);
  }

  public destroy(): void {
    if (!this.graphic) return;
    this.host.removeChild(this.graphic);
    this.graphic.destroy();
    this.graphic = null;
  }
}
