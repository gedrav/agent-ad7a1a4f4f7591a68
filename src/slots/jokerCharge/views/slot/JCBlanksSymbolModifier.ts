import { Container } from 'pixi.js';
import { PixSprite } from '@core/pixiwrapper/PixSprite';
import { UIUtil } from '@core/utils/UIUtilService';
import { isRowActive } from '@slots/jokerCharge/models/JCLinesState';

const BLANKS_IMAGE_DIM = 'bg_joker';
const BLANKS_IMAGE_BRIGHT = 'bg_joker_bright';

export class JCBlanksSymbolModifier {
  private sprite: PixSprite | null = null;

  constructor(private readonly host: Container) {}

  // Called every time this cell becomes/stays Blanks, since the same pooled instance can be
  // reused at a different row later and the active-row state can change between spins - so this
  // always re-checks isRowActive() rather than only building the sprite once.
  public create(row: number): void {
    const image = isRowActive(row) ? BLANKS_IMAGE_BRIGHT : BLANKS_IMAGE_DIM;
    if (this.sprite) {
      this.sprite.texture = UIUtil.getTexture(image);
      return;
    }
    this.sprite = UIUtil.getSprite(image);
    this.sprite.anchor.set(0.5, 0.5);
    this.host.addChild(this.sprite);
  }

  public destroy(): void {
    if (!this.sprite) return;
    this.host.removeChild(this.sprite);
    this.sprite.destroy();
    this.sprite = null;
  }
}
