import { Container } from 'pixi.js';
import { PixSpine } from '@core/pixiwrapper/PixSpine';
import { UIUtil } from '@core/utils/UIUtilService';
import { isRowActive } from '@slots/jokerCharge/models/JCLinesState';

// Same rig the bonus panel uses, on its tile skins - see BonusReelSymbol. Its only animation is
// empty, so the skin is the whole picture and there's nothing to play.
const BLANKS_SPINE_NAME = 'reel_sym_add';
const BLANKS_SKIN_ACTIVE = 'reels_tile_light';
const BLANKS_SKIN_INACTIVE = 'reels_tile_dark';
// The blur tiles are taller than the static ones (1010 against 972), which is what closes the gap
// between two cells while the strip moves.
const BLANKS_SKIN_BLUR_SUFFIX = '_blur';

export class JCBlanksSymbolModifier {
  private spine: PixSpine | null = null;
  private row = 0;
  private blurred = false;

  constructor(private readonly host: Container) {}

  // Called every time this cell becomes/stays Blanks, since the same pooled instance can be
  // reused at a different row later and the active-row state can change between spins - so this
  // always re-checks isRowActive() rather than only picking the skin once.
  public create(row: number): void {
    this.row = row;
    // A symbol being placed is always at rest, whatever the last spin left behind.
    this.blurred = false;
    if (this.spine) {
      this.applySkin();
      return;
    }
    this.spine = UIUtil.getSpineAnim(BLANKS_SPINE_NAME, {
      spineName: BLANKS_SPINE_NAME,
      defaultSkin: this.resolveSkin(),
    });
    this.spine.label = 'blanksTile';
    this.host.addChild(this.spine);
  }

  public setBlurred(flag: boolean): void {
    if (this.blurred === flag) return;
    this.blurred = flag;
    this.applySkin();
  }

  private applySkin(): void {
    this.spine?.setSkin(this.resolveSkin());
  }

  private resolveSkin(): string {
    const skin = isRowActive(this.row) ? BLANKS_SKIN_ACTIVE : BLANKS_SKIN_INACTIVE;
    return this.blurred ? skin + BLANKS_SKIN_BLUR_SUFFIX : skin;
  }

  public destroy(): void {
    if (!this.spine) return;
    this.spine.destroySpine();
    this.spine.destroy();
    this.spine = null;
  }
}
